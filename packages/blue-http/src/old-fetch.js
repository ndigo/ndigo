/**
 * Extended Fetch API with support for data transformers and error handling.
 *
 * @author Ben White
 * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API}
 * @return {Function}
 */
define(function (require) {
    'use strict';
    var root = require('blue/root'),
        URI = require('URI'),
        logger = require('blue/log')('[http:fetch]'),
        rxSpace = /%20/g,
        rxNoBody = /^(?:GET|HEAD)$/,
        cache = {
            lastModified: {},
            etag: {},
        },
        isPhantomBug = function (result) {
            return result.status === 0 && (root._phantom || root.callPhantom) && result.url.slice(0, 5) === 'file:';
        },
        // data conversion routines
        converters = {
            text: function (response) {
                return response.text();
            },
            json: function (response) {
                return response.json().catch(function (err) {
                    // If JSON parse fails, attempt to preserve response header info for downstream code
                    if (response.headers) {
                        err.headers = response.headers;
                    }
                    if (response.status) {
                        err.status = response.status;
                        err.statusText = response.statusText;
                    }
                    throw err;
                });
            },
            xml: function (response) {
                return response.text().then(function (data) {
                    return new DOMParser().parseFromString(data, 'text/xml');
                });
            },
            // BLUEJS-4349
            image: function (response) {
                if (response._bodyBlob) {
                    return Promise.resolve(response._bodyBlob);
                } else if (typeof response.blob === 'function') {
                    return response.blob();
                } else if (response.body && response.body instanceof ReadableStream) {
                    return response;
                }
                return Promise.reject(new Error('Blue:fetch - expected image blob, blob not found'));
            },
        },
        // mime-type conversion mapping
        mimeTypes = {
            text: converters.text,
            'application/json': converters.json,
            'text/json': converters.json,
            'application/xml': converters.xml,
            'text/xml': converters.xml,
            // Images
            'image/bmp': converters.image,
            'image/gif': converters.image,
            'image/x-icon': converters.image,
            'image/jpeg': converters.image,
            'image/png': converters.image,
            'image/svg+xml': converters.image,
            'image/tiff': converters.image,
            'image/webp': converters.image,
        },
        // method for converting data to proper format
        convertData = function (response, dataType) {
            var mimeType = response.headers.get('Content-Type') || '',
                mimeParts = mimeType.split('/'),
                converter = converters[dataType] || mimeTypes[mimeType] || mimeTypes[mimeParts[0]];
            if (converter) {
                return converter(response);
            }
            return response.text();
        },
        // converts data parameters to encoded string
        getParams = function (data) {
            var pairs = [],
                add = function (key, value) {
                    // If value is a function, invoke it and return its value
                    var realValue;

                    if (value && value.constructor === Function) {
                        realValue = value();
                    } else if (value === null) {
                        realValue = '';
                    } else {
                        realValue = value;
                    }

                    pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(realValue));
                };
            switch (data && data.constructor) {
                case Array:
                    data.forEach(function (item) {
                        item && add(item.name, item.value);
                    });
                    break;
                case Object:
                    Object.keys(data).forEach(function (name) {
                        add(name, data[name]);
                    });
                    break;
            }
            return pairs.join('&').replace(rxSpace, '+');
        },
        getAbsUrl = function (fullUrl) {
            return URI(fullUrl).absoluteTo(root.location.href).toString();
        };

    return function (url, options) {
        var data,
            cacheData,
            fullUrl,
            fullOptions,
            // process (options) or (url, options)
            orgOptions = options || (url && url.constructor === Object && url) || {},
            fetchPromise,
            fetchTimeout,
            abort = false;

        if (orgOptions.beforeSend && orgOptions.beforeSend.constructor === Function) {
            logger.warn('DEPRECATED:BLUEJS-770:"beforeSend" is not a supported service option');
            orgOptions.beforeSend(
                {
                    // included this since cxo is using this currently
                    // todo: this should be removed once they properly convert their code
                    setRequestHeader: function (key, value) {
                        !('headers' in orgOptions) && (orgOptions.headers = {});
                        orgOptions.headers[key] = value;
                    },
                },
                orgOptions
            );
        }

        fullUrl = orgOptions.url || url;
        fullOptions = {
            cache: 'default',
            credentials: 'same-origin',
            headers: orgOptions.headers || {},
            method: orgOptions.method || orgOptions.type || 'GET',
            mode: 'cors',
            redirect: 'follow',
        };
        if (
            orgOptions.data &&
            orgOptions.data.constructor !== String &&
            // process data unless explicitly disabled
            (!('processData' in orgOptions) || orgOptions.processData)
        ) {
            data = getParams(orgOptions.data);
        } else {
            data = orgOptions.data;
        }

        if (data) {
            // mimic jQuery logic for data in url or body
            if (rxNoBody.test(fullOptions.method)) {
                fullUrl += (fullUrl.indexOf('?') === -1 ? '?' : '&') + data;
            } else {
                fullOptions.body = data;
            }
        }

        ['complete', 'dataFilter', 'error', 'success', 'xhr'].forEach(function (key) {
            orgOptions[key] && logger.warn('DEPRECATED:BLUEJS-770:"' + key + '" is not a supported service option');
        });

        orgOptions.xhrFields && orgOptions.xhrFields.withCredentials && (fullOptions.credentials = 'include');

        // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
        if (orgOptions.ifModified) {
            (cacheData = cache.lastModified[fullUrl]) && (fullOptions.headers['If-Modified-Since'] = cacheData);
            (cacheData = cache.etag[fullUrl]) && (fullOptions.headers['If-None-Match'] = cacheData);
        }

        // BLUEJS-5265
        if (orgOptions.timeout && !isNaN(parseInt(orgOptions.timeout)) && parseInt(orgOptions.timeout) > 0) {
            fullOptions.timeout = parseInt(orgOptions.timeout);
        }

        orgOptions.contentType && (fullOptions.headers['Content-Type'] = orgOptions.contentType);

        return new Promise(function (resolve, reject) {
            // BLUEJS-5265 - prepare to abort the fetch call if timeout happens.
            // AbortController may not be supported in all browsers.
            var controller = root.AbortController ? new AbortController() : undefined;
            var signal = controller ? controller.signal : undefined;

            if (fullOptions.timeout) {
                if (signal) {
                    fullOptions.signal = signal;
                }

                fetchTimeout = setTimeout(function () {
                    abort = true;
                    // controller.abort() will cause fetch to throw an exception with AbortError.
                    // The fetch error is ignored by our fetch catch clause below so we can return
                    // the expected timeout error.
                    if (controller) {
                        controller.abort();
                    }
                    reject({
                        headers: new root.Headers(),
                        status: 0,
                        statusText: 'Request timed out',
                        url: getAbsUrl(fullUrl),
                    });
                }, fullOptions.timeout);
            }

            root.fetch(new root.Request(fullUrl), fullOptions)
                .then(function (response) {
                    // BLUEJS-5265 - apply a timeout to the fetch call. When fetch
                    // execution is finished, clear the timeout.
                    if (!abort) {
                        if (fetchTimeout) {
                            clearTimeout(fetchTimeout);
                        }

                        var result = {
                            headers: response.headers,
                            status: response.status,
                            statusText: response.statusText,
                            url: response.url || getAbsUrl(fullUrl),
                        };

                        // check for http failure
                        // phantom incorrectly returns status 0 for ajax requests to local file resources
                        if (!response.ok && !isPhantomBug(result)) {
                            return response.text().then(function (data) {
                                result.data = data;
                                throw result;
                            });
                        }

                        // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
                        if (orgOptions.ifModified) {
                            (cacheData = response.headers.get('Last-Modified')) &&
                                (cache.lastModified[fullUrl] = cacheData);
                            (cacheData = response.headers.get('etag')) && (cache.etag[fullUrl] = cacheData);
                        }

                        resolve(
                            convertData(response, orgOptions.dataType).then(function (data) {
                                result.data = data;
                                return result;
                            })
                        );
                    } else {
                        // swallow the catch, we aborted the service call
                    }
                })
                .catch(function (error) {
                    // BLUEJS-5265 - apply a timeout to the fetch call. When fetch
                    // execution is finished, clear the timeout.
                    if (!abort) {
                        if (fetchTimeout) {
                            clearTimeout(fetchTimeout);
                        }

                        // http error or fetch error
                        reject(
                            error.headers
                                ? error
                                : {
                                      headers: new root.Headers(),
                                      status: 0,
                                      statusText: error.message,
                                      url: getAbsUrl(fullUrl),
                                  }
                        );
                    } else {
                        // swallow the catch, we aborted the service call
                    }
                });
        });
    };
});
