/**
 * @author Aaron Brown
 * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
 */
define(function (require) {
    'use strict';

    var doc = require('blue/dom');

    /**
     * @function module:blue-app/data/interceptor/appReset~toNumber
     * @param {*} val
     */
    function toNumber(val) {
        return val * 1;
    }

    /**
     * @const {module:blue-app/service.ServiceInterceptor} module:blue-app/data/interceptor/appReset
     */
    return {
        around: function appResetInterceptor(joinpoint) {
            var appResetCode = 205,
                resultPromise,
                result;

            resultPromise = new Promise(function (resolve, reject) {
                result = joinpoint.proceed();
                result
                    .then(function (data) {
                        resolve(data);
                    })
                    .catch(function (response) {
                        var status = toNumber(response.status);
                        // BLUEJS-2125 - changing the app-reset-code from 303 to 205, should handle both old and new to be safe
                        if (
                            (status === appResetCode || status === 303) &&
                            doc.location &&
                            doc.location.hostname !== 'localhost'
                        ) {
                            doc.location.reload(true);
                        }

                        reject(response);
                    });
            });

            return resultPromise;
        },
    };
});
