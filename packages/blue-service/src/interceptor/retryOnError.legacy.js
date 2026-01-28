/**
 * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
 * @classdesc
 * This is new service interceptor for retry method on service request fails.
 * This retry method will be execute by given retry limit numbers. By default it wont execute.
 * This will hold service response until retry limit completed.
 */
/* eslint-disable vars-on-top */
/* eslint-disable one-var */
define(function () {
    'use strict';
    return {
        around: function (joinpoint) {
            var retryLimit = 0,
                retryBufferInterval = 0,
                retryHeader = '',
                retryStatusCodes = [],
                isRetryStatus = function (retryStatusCodes, resStatusCode) {
                    if (
                        Array.isArray(retryStatusCodes) &&
                        retryStatusCodes.length > 0 &&
                        retryStatusCodes.indexOf(resStatusCode) < 0
                    ) {
                        return false;
                    }
                    return true;
                };
            return new Promise(function (resolve, reject) {
                var args0 = joinpoint.args.length && joinpoint.args[0];
                retryLimit = args0.retryLimit || retryLimit;
                retryBufferInterval = args0.retryBufferInterval || retryBufferInterval;
                retryHeader = args0.retryHeader || retryHeader;
                retryStatusCodes = args0.retryStatusCodes || retryStatusCodes;
                var getRetryBufferInterval = function (interval) {
                        var bufferInterval = pasrseInt(interval);
                        //Numeric Range 1-120 seconds
                        if (typeof bufferInterval === 'number' && bufferInterval > 0 && bufferInterval <= 120) {
                            return parseInt(bufferInterval) * 1000;
                        } else {
                            return 0;
                        }
                    },
                    noop = function () {};
                var request = function () {
                    joinpoint
                        .proceed()
                        .then(resolve)
                        .catch(function (response) {
                            var error = response || { getResponseHeader: noop };
                            if (retryHeader) {
                                //convert seconds to milliseconds
                                retryBufferInterval = getRetryBufferInterval(error.getResponseHeader(retryHeader));
                            }
                            if (
                                retryBufferInterval >= 0 &&
                                retryLimit > 0 &&
                                isRetryStatus(retryStatusCodes, response.status)
                            ) {
                                // retry service
                                setTimeout(function () {
                                    request();
                                }, retryBufferInterval);
                            } else {
                                reject(response);
                            }
                            retryLimit--;
                        });
                };
                request();
            });
        },
    };
});
