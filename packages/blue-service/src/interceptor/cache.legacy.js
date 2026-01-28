/**
 * @author Aaron Brown, Ben White
 * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
 * @classdesc
 * Check each request to see if a cached response had previously been saved
 * Check each response from server for cache entries and save them
 *
 * service options:
 *   cachePropName String The name of the response property that will contain the cache entries (default: cache)
 *   cacheResponse String Flag to force the response to be saved in cache (ONCE, SESSION, default: undefined)
 *
 * A response from the server would look something like this
 * {cache: [
 *   {url: '/path/to/service1', response: {json: 1234}, usage: 'ONCE'},
 *   {url: '/path/to/service2', request: {param1: 'value'}, response: {json: 9999}, usage: 'SESSION'}
 * ]}
 * The above cache entries would add to entries into the cache interceptor
 *
 * This ajax request would hit the first entry one time, and request data from the server afterwards
 * {url: '/path/to/service1'}
 * The response would be the following
 * {json: 1234}
 */
/* eslint-disable complexity */
define(function (require) {
    'use strict';

    var globalStore = {},
        Deferred = require('blue/deferred'),
        // todo: ignore querystring params until proper cxo adoption
        ignoreQueryString = true,
        cachePropName = 'cache',
        validTypes = {
            DELETE: 1,
            ONCE: 1,
            SESSION: 1,
        },
        dataMatch = function (a, b) {
            var key,
                aKeys = Object.keys(a || {}),
                bKeys = Object.keys(b || {});
            // dummy check
            if (aKeys.length !== bKeys.length) {
                return false;
            }
            if (!aKeys.length) {
                return true;
            }
            // value checks
            for (key in a) {
                if (a[key] !== b[key]) {
                    return false;
                }
            }
            for (key in b) {
                if (a[key] !== b[key]) {
                    return false;
                }
            }
            return true;
        },
        // get (key, data)
        // BLUEJS-4733 - handling overlapping service calls by
        // returning existing request promise if available. Extra "noDelete"
        // parameter is used to allow cache to be queried internally without
        // accidentally destroying a one-time cache.
        getCache = function (cacheKey, requestData, noDelete) {
            var response,
                responses = globalStore[cacheKey] || [],
                x = responses.length;

            // search for data match
            while (x--) {
                response = responses[x];
                if (dataMatch(requestData, response.request)) {
                    // BLUEJS-4733 - see comment above
                    if (!noDelete && response.usage === 'ONCE') {
                        // clean up once type cache entries
                        responses.splice(x, 1);
                        // clean up empty cache entries
                        !responses.length && delete globalStore[cacheKey];
                    }
                    // return cached service response
                    return response.response;
                }
            }
        },
        setCache = function (cacheKey, replaceWith) {
            var response,
                // are we adding or deleting data?
                add = replaceWith.response && replaceWith.usage !== 'DELETE',
                responses =
                    globalStore[cacheKey] ||
                    (add
                        ? // ensure cache store exists
                          (globalStore[cacheKey] = []) // jshint ignore:line
                        : // removing, so return fake store
                          []),
                request = replaceWith.request || {},
                x = responses.length;
            // search for data match
            while (x--) {
                response = responses[x];
                if (dataMatch(request, response.request)) {
                    if (add) {
                        // replace existing cache
                        responses[x] = replaceWith;
                    } else {
                        // delete existing cache
                        responses.splice(x, 1);
                        // clean up empty cache entries
                        !responses.length && delete globalStore[cacheKey];
                    }
                    return;
                }
            }
            // no match found, add new entry
            add && responses.push(replaceWith);
        },
        asyncResult = function (response) {
            return new Promise(function (resolve) {
                // Force cached values to return asynchronously so their behavior matches a real service
                setTimeout(function () {
                    resolve(response);
                }, 0);
            });
        },
        processData = function (cacheProp, response) {
            var x,
                rawKey,
                cacheKey,
                cacheEntry,
                cache = (response || {})[cacheProp];
            // validate cache container
            if (cache && cache.constructor === Array && (x = cache.length)) {
                while (x--) {
                    cacheEntry = cache[x] || {};
                    // validate cache entry
                    if (!cacheEntry.url || !cacheEntry.response || !validTypes[cacheEntry.usage]) {
                        continue;
                    }
                    // save/update cache entry
                    (rawKey = cacheEntry.url), (cacheKey = ignoreQueryString ? rawKey.split('?')[0] : rawKey);
                    setCache(cacheKey, cacheEntry);
                }
            }
        };

    return {
        around: function cacheInterceptor(joinpoint) {
            var deferred,
                settings = joinpoint.args[0],
                requestURL = ignoreQueryString ? settings.url.split('?')[0] : settings.url,
                requestData = settings.data || {},
                cacheProp = settings.cachePropName || cachePropName,
                cacheResponse = validTypes[settings.cacheResponse] && settings.cacheResponse,
                cacheData = settings.cacheData,
                cacheInject = cacheData && validTypes[cacheData.usage] && cacheData.usage,
                response = cacheInject && cacheData.response;

            // data forced into cache
            if (cacheInject) {
                // save/update/clear cache entry
                setCache(requestURL, {
                    usage: cacheInject,
                    request: requestData,
                    response: response,
                });
                processData(cacheProp, response);
                return asyncResult(response);

                // response forced into cache
                // BLUEJS-4733 - Only trigger new http request (and cache storage) if there
                // is no matching request in process. Uses modified "getCache" that will
                // return result in a non-destructive way even for one-time caches.
            } else if (cacheResponse && !getCache(requestURL, requestData, true)) {
                deferred = new Deferred();
                // save/update cache entry
                setCache(requestURL, {
                    usage: cacheResponse,
                    request: requestData,
                    response: deferred.promise,
                });

                // already cached data
            } else if ((response = getCache(requestURL, requestData))) {
                return asyncResult(response);
            }

            return joinpoint
                .proceed()
                .then(function (response) {
                    processData(cacheProp, response);
                    // check if caching was requested for this service
                    if (cacheResponse) {
                        // update cache entry
                        setCache(requestURL, {
                            usage: cacheResponse,
                            request: requestData,
                            response: response,
                        });
                        deferred.resolve(response);
                    }
                    return response;
                })
                .catch(function (ex) {
                    // check if caching was requested for this service
                    if (cacheResponse) {
                        // delete cache entry
                        setCache(requestURL, {
                            usage: 'DELETE',
                            request: requestData,
                        });
                        deferred.reject(ex);
                    }
                    throw ex;
                });
        },
    };
});
