/**
 * @author Jeff Rose and Mark Saunders
 * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
 */
define(function (require, exports, module) {
    'use strict';
    var createNull = Object.create.bind(Object, null),
        asConstructable = require('blue/as/constructable'),
        asContextual = require('blue/as/contextual'),
        asSerializable = require('blue/as/serializable'),
        getLogger = require('blue/log'),
        header = require('./service/interceptor/header'),
        errorInt = require('./service/interceptor/error'),
        cacheInt = require('./service/interceptor/cache'),
        is = require('blue/is'),
        appSettings = require('./settings'),
        intercept = require('blue/intercept'),
        http = require('blue/http'),
        clone = require('blue/util').object.deepClone,
        mixIn = require('mout/object/mixIn'),
        guid = require('mout/random/guid'),
        sessionStore = new (require('blue/store/enumerable/session'))('servicesettings'),
        cookieStore = new (require('blue/store/enumerable/cookie'))(null, true),
        channelId = require('blue/root').channel,
        perf = require('blue/perf'),
        withServiceConfigAPI = require('blue-app/with/serviceConfigAPI'),
        hasOwnProperty = Object.prototype.hasOwnProperty,
        config = module.config(),
        csrf = config ? config.CSRF || {} : {},
        logger = getLogger('[blue:app]'),
        uid = 0,
        serviceCallId = 0,
        allArrayElementsEqual = function (a, b) {
            var aLength = a.length,
                bLength = b.length,
                i = 0;

            if (aLength !== bLength) {
                return false;
            }
            for (; i <= aLength; i++) {
                if (a[i] !== b[i]) {
                    return false;
                }
            }
            return true;
        };

    /**
     * @typedef {external:Object} module:blue-app.Service~ServiceSettings
     */

    /**
     * @typedef {module:blue/intercept.Interceptor} module:blue-app.Service.ServiceInterceptor
     * @property {external:Function} around
     */

    /**
     * @event module:blue-app.Service~blue:service:serviceCallBegin
     */

    /**
     * @event module:blue-app.Service~blue:service:serviceCallComplete
     */

    // BLUEJS-3698 - updated to ensure injected channel value is usable
    if (channelId === 'undefined' || typeof channelId !== 'string') {
        channelId = false;
    }

    if (channelId) {
        // required by DPS, see Maqbul
        channelId = 'id=' + channelId;
    }

    // TODO Move CSRF retrieval logic outside of service, and x-jpmc-client-request-id, and x-jpmc-channel

    // Define defaults
    csrf.header = csrf.header || 'x-jpmc-csrf-token';
    csrf.cookie = csrf.cookie || 'authcsrftoken';

    /**
     * @class module:blue-app.Service
     * @extends null
     * @param {external:string} this.serviceCalls - defined in derived classes
     * @example
     * this.serviceCalls = {
     *   readDetail : {
     * 	    settings : {
     * 	        url: 'http://localhost:9000/bluejs-mvc/',
     * 	        type: 'GET',
     * 	        xhrFields: {
     * 	            withCredentials: true
     * 	        }
     * 	    }
     * 	 }
     * }
     */
    // eslint-disable-next-line vars-on-top,one-var
    var Service = function (name, parentContext) {
        this.name = name;
        this.id = '<' + name + 'Service:' + uid++ + '>';

        // Parent context should be from an Area or Application.
        // Services do not need a child context and use the parent's context directly.
        this.defineContext(parentContext, {
            name: name,
            logger: getLogger('[service:' + name + ']'),
            // // Do not set serviceSettings here - this will override parent context
            // // service settings, causing app/area interceptors and other settings to be
            // // lost.
            // serviceSettings: {
            // 	value: createNull(),
            // 	configurable: true,
            // 	enumerable: true,
            // 	writable: true
            // }
        });

        this.defineConstruct(this.context);

        /* this.context.serviceSettings
            {
                type:'POST',
                dataType:'json',
                contentType:'application/x-www-form-urlencoded',
                timeout: 5000,
                redirect: true,
                crossDomain: true,
                xhrFields:{
                    withCredentials: true
                }
            }
         */

        this.defineInterceptors();
        withServiceConfigAPI.call(this);

        Object.defineProperty(this, 'serviceCalls', {
            set: function (serviceCalls) {
                var names = Object.keys(serviceCalls),
                    name;

                // eslint-disable-next-line vars-on-top
                for (var i = 0, length = names.length; i < length; i++) {
                    name = names[i];
                    this.addServiceCall(name, serviceCalls[name].settings);
                }
            },
            configurable: true,
            enumerable: false,
        });

        is.function(this.init) && this.init.call(this);

        this._appliedLocalInterceptors = false;

        perf.count.call({ id: this.id, ref: this }, 'blue/service', 'create', name);
    };

    Service.prototype = createNull();

    Service.prototype.constructor = Service;

    /**
     * @function module:blue-app.Service#http
     */
    Service.prototype.http = http;

    /**
     * @member {external:Array} module:blue-app.Service#interceptors
     */
    Service.prototype.interceptors = [header, errorInt, cacheInt];

    /**
     * @function module:blue-app.Service#addServiceCall
     */
    Service.prototype.addServiceCall = function (name, settings) {
        var that = this;

        if (is.undefined(this._serviceCalls)) {
            this._serviceCalls = createNull();
        }

        // Create the private entry for the service call
        this._serviceCalls[name] = createNull();

        // Store the call settings
        this.settings(name, settings);

        // ADB - attach interceptors from context.serviceSettings at
        // point of service creation, not at time of each service call.
        // First, this is faster. Second, the other way makes it impossible
        // to attach interceptors to a service without having them
        // overridden.
        // if ( is.defined( this.context.serviceSettings.interceptors ) ) {
        // 	this.interceptors = this.context.serviceSettings.interceptors;
        // }

        // BLUEJS-3546 - re-apply service settings according to whether base interceptors
        // have been added to in this service instance. Ensure same order of execution
        // either way.
        // Order should be set so that, for around interceptors, they should execute
        // with prototype interceptors as close to service as possible:
        // App1 -> App2 -> Bluejs1 -> Bluejs2 -> Service -> Bluejs2 -> Bluejs1 -> App2 -> App1
        // Also, moved this code out of service call to here. This prevents interceptors from being
        // destroyed for already running service call - that was causing advice errors since
        // interceptors were undefined when service returned

        // Service interceptors once again removed from this region of the code due to
        // asynchronous nature of wire spec processing. In some cases the services
        // are created before the context.serviceSettings is applied for that layer, resulting
        // in some interceptors not being applied. Must apply interceptors at last possible
        // moment, so moved code back inside service request call with extra code
        // to prevent doing so multiple times (see comment above for error)

        // removed service interceptors assignment from this location

        // Create service call function
        // eslint-disable-next-line complexity
        this[name] = function (data, options) {
            var serviceCall = that._serviceCalls[name],
                callId,
                callSettings,
                key;

            serviceCallId++;
            callId = serviceCallId;

            // Merge settings if they have not been merged already
            // _this block should only execute the first time the service call is executed
            if (is.undefined(serviceCall.settings)) {
                var serviceSettings = clone(that.context.serviceSettings) || {};

                // Only gather and set interceptors once for a service call to prevent them
                // from being destroyed when same call is executed multiple times
                if (!that._appliedLocalInterceptors) {
                    // Individually-assigned interceptors were applied, so add instance interceptors along with
                    // contextual + prototype interceptors
                    if (allArrayElementsEqual(that._interceptors, Object.getPrototypeOf(that).interceptors)) {
                        that.interceptors = that.context.getServiceInterceptors(that).reverse();
                    } else {
                        that.interceptors = that._interceptors
                            .concat(that.context.getServiceInterceptors(that))
                            .reverse();
                    }
                    that._appliedLocalInterceptors = true;
                }
                // Start with the service default settings
                serviceCall.settings = that._serviceCalls[name].settings = serviceSettings;

                // Overlay the service call settings onto the default settings
                for (key in serviceCall.defaults) {
                    if (hasOwnProperty.call(serviceCall.defaults, key)) {
                        serviceCall.settings[key] = that._serviceCalls[name].settings[key] = serviceCall.defaults[key];
                    }
                }

                // Now that the settings are merged, delete the default settings
                delete that._serviceCalls[name].defaults;
            }

            // Merge in run-time settings if they exist
            callSettings = mixIn({}, serviceCall.settings, options || {});

            that.prerequest(callSettings, data);

            // BLUEJS-3600 - add new route events
            that.context.bubble('blue:service:serviceCallBegin', {
                msgType: 'blue:service:serviceCallBegin',
                contextPath: that.context.getStack(),
                id: callId,
                service: that.name || '',
                seviceCall: name,
                application: that.context.application ? that.context.application.name || '' : '',
                area: that.context.area ? that.context.area.name || '' : '',
                controller: that.context.controller ? that.context.controller.name || '' : '',
            });

            return new Promise(function (requestResolve, requestReject) {
                that.request(callSettings)
                    .then(function (val) {
                        // BLUEJS-3600 - add new route events
                        that.context.bubble('blue:service:serviceCallComplete', {
                            msgType: 'blue:service:serviceCallComplete',
                            contextPath: that.context.getStack(),
                            id: callId,
                            service: that.name || '',
                            seviceCall: name,
                            application: that.context.application ? that.context.application.name || '' : '',
                            area: that.context.area ? that.context.area.name || '' : '',
                            controller: that.context.controller ? that.context.controller.name || '' : '',
                        });

                        requestResolve(val);
                    })
                    .catch(function (val) {
                        // BLUEJS-3600 - add new route events
                        that.context.bubble('blue:service:serviceCallComplete', {
                            msgType: 'blue:service:serviceCallComplete',
                            contextPath: that.context.getStack(),
                            service: that.name || '',
                            seviceCall: name,
                            application: that.context.application ? that.context.application.name || '' : '',
                            area: that.context.area ? that.context.area.name || '' : '',
                            controller: that.context.controller ? that.context.controller.name || '' : '',
                        });

                        requestReject(val);
                    });
            });
        };
    };

    /**
     * @function module:blue-app.Service#destroy
     */
    Service.prototype.destroy = function () {
        var names = Object.keys(this._serviceCalls),
            index = names.length,
            name;

        while (index--) {
            name = names[index];
            delete this[name];
            delete this._serviceCalls[name];
        }

        this.destroyConstruct();
        this.destroyInterceptors();
        this.destroyContext();

        delete this._serviceCalls;
        delete this.serviceCalls;

        this.addServiceCall = this.destroy = this.prerequest = this.request = function () {};

        perf.count.call({ id: this.id }, 'blue/service', 'destroy', this.name);
    };

    /**
     * @function module:blue-app.Service#prerequest
     * @param {module:blue-app.Service~ServiceSettings} settings
     * @param {external:Object} data
     * @returns {module:blue-app.Service~ServiceSettings} The processed settings
     */ // eslint-disable-next-line complexity
    Service.prototype.prerequest = function (settings, data) {
        var fqdn, removeCsrf, removeClientReqId, removeChannelId;

        settings.data = data || createNull();
        if (settings.url.substr(0, 4).toLowerCase().indexOf('http') !== 0) {
            fqdn = sessionStore.get('serviceFQDN');
            settings.url = fqdn ? fqdn + settings.url : settings.url;
        }

        // Obtain the csrf token being used (doing on a per request basis, because the cookie could be set at different stages)
        csrf.token = cookieStore.get(csrf.cookie) || null;

        // Keep the token within the module, and make it accessible to other modules through the app settings
        // REVIEW - Since the code is now updated to check directly in cookieStore on every request should the token be set in appSettings still?
        csrf.token && appSettings.set(csrf.cookie, csrf.token);

        // Should the CSRF code be removed
        // Bluejs-685 - checking csrf header to null or undefined
        removeCsrf = !!(csrf.disable || settings.disableCsrf);

        // BLUEJS-1705 & TEMS-4142 - add x-jpmc-client-request-id header to all DPS requests.
        removeClientReqId = removeCsrf || settings.disableTrace; // CHC - tieing removal of client-request-id to removal of csrf to not impace SCRUM teams.
        removeChannelId = removeCsrf || settings.disableChannelId; // tie to previous, so no impact to CXO scrum
        settings.headers = settings.headers || {};

        if (!removeClientReqId) {
            settings.headers['x-jpmc-client-request-id'] = guid();
        } else if (removeClientReqId && settings.headers) {
            delete settings.headers['x-jpmc-client-request-id'];
        }

        if (!removeChannelId && channelId) {
            settings.headers['x-jpmc-channel'] = channelId;
        } else if (removeChannelId && settings.headers) {
            delete settings.headers['x-jpmc-channel'];
        }

        // Add the token if available and permitted
        // BLUEJS-1155 - send csrf header irrespective token value as long as disableCsrf is set to false
        // BLUEJS-1179 - send NONE when CSRF token is not found. Firefox doesn't honour empty header values
        // https://bugzilla.mozilla.org/show_bug.cgi?id=815299
        if (!removeCsrf) {
            settings.headers[csrf.header] = csrf.token || 'NONE';

            // In case of removal, make sure it wasn't already set (usually header = null)
        } else if (removeCsrf && settings.headers) {
            delete settings.headers[csrf.header];
        }

        // assist with testing
        return settings;
    };

    /**
     * @function module:blue-app.Service#request
     * @param {module:blue-app.Service~ServiceSettings} settings
     * @returns {external:Promise} The promise from asynchronous http request.
     */
    Service.prototype.request = function (settings) {
        perf.count('blue/service', 'request', settings.url);
        return new Promise(
            function (resolve, reject) {
                this.http
                    .request(settings)
                    .then(function (data) {
                        resolve(data);
                    })
                    .catch(
                        function (error) {
                            logger.warn(
                                '[' + this.context.getStack() + ']',
                                'Service request failed (url:' +
                                    settings.url +
                                    '; status:' +
                                    error.status +
                                    '; statusText:' +
                                    error.statusText +
                                    ')'
                            );
                            reject(error);
                        }.bind(this)
                    );
            }.bind(this)
        );
    };

    /**
     * @function module:blue-app.Service#settings
     * @param {external:string} name
     * @param {*} value
     */
    Service.prototype.settings = function (name, value) {
        var settings;

        if (!(name in this._serviceCalls)) {
            throw new Error('service "' + name + '" does not exist');
        }

        // Getter
        if (is.undefined(value)) {
            settings = this._serviceCalls[name].defaults || this._serviceCalls[name].settings;

            // Setter
        } else {
            if (!('url' in value)) {
                throw new Error('"url" is a required setting');
            }

            this._serviceCalls[name].defaults = value;

            if ('settings' in this._serviceCalls[name]) {
                delete this._serviceCalls[name].settings;
            }
        }

        return settings;
    };

    // add serializable functionality
    asSerializable.call(Service.prototype, function () {
        return {
            id: this.id || 'empty id',
        };
    });

    asConstructable.call(Service.prototype);
    Service = asContextual.call(Service, { name: 'service' });
    intercept.withInterceptors.call(Service.prototype, 'request');

    return Service;
});
