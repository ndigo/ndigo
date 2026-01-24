/**
 * @author Jeff Rose
 * @module blue-app/component
 */
define(function (require) {
    'use strict';

    var createNull = Object.create.bind(Object, null),
        defineProperty = Object.defineProperty,
        defineProperties = Object.defineProperties,
        keys = Object.keys,
        root = require('blue/root'),
        asContextual = require('blue/as/contextual'),
        asSerializable = require('blue/as/serializable'),
        compose = require('blue/compose'),
        EventChannel = require('blue/event/channel'),
        getLogger = require('blue/log'),
        is = require('blue/is'),
        localeSettings = require('./localeSettings'),
        map = require('blue/util').object.map,
        observable = require('blue/observable'),
        perf = require('blue/perf'),
        validator = require('./component/validator'),
        legacyCompPath = 'blue-legacy/blue-app/',
        logger = getLogger('[blue:app]'),
        // get ref to legacy comp if it's included by the app
        legacyComp = require.specified(legacyCompPath + 'config') && root.require(legacyCompPath + 'component'), // jshint ignore:line
        uuid = 0,
        // our secret getter/setter
        secret = function (name, value) {
            // eslint-disable-next-line default-case
            switch (arguments.length) {
                // getter
                case 1:
                    return this[name];
                // setter
                case 2:
                    return (this[name] = value);
                // cleanup
                case 0:
                    keys(this).forEach(function (key) {
                        delete this[key];
                    }, this);
            }
        },
        checkListeners = function (fullPath, newValue) {
            var id,
                handler,
                name = fullPath.split('.')[0],
                listeners = this._('listeners'),
                handlers = listeners[name] || {};
            for (id in handlers) {
                // jshint ignore:line
                handler = handlers[id];
                try {
                    handler.h.call(handler.s, newValue, fullPath);
                } catch (ex) {
                    logger.error(
                        '[' + this.context.getStack() + ']',
                        'Calling "' + name + '" data-change listener',
                        ex
                    );
                }
            }
        },
        /**
         * HELPER FUNCTIONS
         */

        isReservedWord = function (word, context) {
            if (
                {
                    actions: 1,
                    data: 1,
                    key: 1,
                    model: 1,
                    name: 1,
                    settings: 1,
                    spec: 1,
                    states: 1,
                    destroy: 1,
                    destroyView: 1,
                    disable: 1,
                    enable: 1,
                    getDataProperties: 1,
                    getActionNames: 1,
                    getSettingsValues: 1,
                    on: 1,
                    onData: 1,
                    validate: 1,
                }[word]
            ) {
                logger.error('[' + context.getStack() + ']', 'Reserved property being overwritten', word);
            }
        },
        execFunc = function (funcName) {
            // "this" is always passed in by calling function
            var that = this; // jshint ignore:line
            try {
                is.function(that[funcName]) && that[funcName]();
            } catch (e) {
                logger.error('[' + that.context.getStack() + ']', 'Executing-Action "' + funcName + '()"', e);
            }
        },
        createCheck = function (key, cfg) {
            // "this" is always passed in by calling function
            var that = this,
                desc;
            // test against reserved property names
            isReservedWord(key, that.context);
            // test for existing descriptor with getters or setters
            // mixins will create descriptors and we don't want to error on those
            if ((desc = Object.getOwnPropertyDescriptor(that, key)) && (desc.get || desc.set)) {
                logger.error('[' + that.context.getStack() + ']', cfg.type + ' "' + key + '" already defined', desc);
            }
            // test for pre-existing value set
            if (cfg.undef && key in that) {
                logger.error('[' + that.context.getStack() + ']', cfg.type + ' "' + key + '" already set', that[key]);
            }
        },
        // send property change to bridge
        tellBridge = function (name, path, value) {
            var done,
                that = this;
            // don't tell bridge if it's from the bridge
            // or comp disabled and not queuing
            if (that._fromBridge === name || !(that._('enabled') || that._queueData)) {
                return;
            }
            done = perf.count.call({ bucket: 'render' }, 'blue/component', 'emit', that.name, name);
            that.privateOutput.emtest('data', {
                value: name,
                path: path,
                current: value,
            });
            done();
        },
        /**
         * PROPERTIES
         */

        ACTION = {
            descriptor: {
                set: function (properties) {
                    // create the internal actions store
                    this._('actions', createNull());
                    // create action getter/setters
                    keys(properties).forEach(ACTION.init, this);
                    // actions can only be called once...
                    // lets delete it now
                    delete this.actions;
                },
                configurable: true,
                enumerable: false,
            },
            setter: function (name, func) {
                // "this" is always passed in by calling function
                var that = this,
                    actions = that._('actions'),
                    cache = actions[name];

                // Setter
                if (!is.function(func)) {
                    throw new TypeError(name + ' must be a function');
                }
                if (cache && !cache.temp) {
                    logger.error(
                        '[' + that.context.getStack() + ']',
                        'Action "' + name + '()" already set',
                        cache,
                        func
                    );
                }

                // save method to cache
                actions[name] = function () {
                    var result,
                        hash = root.location ? root.location.href : '';
                    // save the circumstances around this call
                    // in case func destroyed this component
                    that.actionRunning = {
                        value: func,
                        action: name,
                        args: arguments,
                        url: hash,
                    };

                    try {
                        result = func.apply(that, arguments);
                    } catch (e) {
                        logger.error('[' + that.context.getStack() + ']', 'Executing-Action "' + name + '()"', e);
                    }

                    delete that.actionRunning;

                    that.privateOutput &&
                        that.privateOutput.emtest('action', {
                            value: name,
                            action: name,
                            args: arguments,
                            result: result,
                            url: hash,
                        });

                    return result;
                };
            },
            init: function (name) {
                // "this" is always passed in by calling function
                var that = this,
                    // save ref to func that should already be there
                    orgFunc = that[name],
                    errorFunc = function () {
                        throw new TypeError('Component ' + that._('id') + ': Action "' + name + '()" is undefined');
                    };

                createCheck.call(that, name, { type: 'Action' });

                // mark this function as the temp function
                errorFunc.temp = true;
                that._('actions')[name] = errorFunc;

                // Create property, e.g. this.fooBar
                defineProperty(that, name, {
                    get: function () {
                        return that._('actions')[name];
                    },
                    set: function (func) {
                        return ACTION.setter.call(that, name, func);
                    },
                    configurable: true,
                    enumerable: true,
                });

                // initialize action if set
                orgFunc && (that[name] = orgFunc);
            },
        },
        DATA = {
            descriptor: {
                set: function (properties) {
                    // create data getter/setters
                    keys(properties).forEach(function (key) {
                        DATA.init.call(this, key, properties[key]);
                    }, this);
                    // data can only be called once...
                    // lets delete it now
                    delete this.data;
                },
                configurable: true,
                enumerable: false,
            },
            validate: function (property, path, index, name, value) {
                // "this" is always passed in by calling function
                var that = this,
                    result,
                    results = [],
                    type = property.type || 'Noop',
                    params = property.params || {},
                    nameLast = name.split('.').pop();

                switch (type) {
                    case 'NoConstraint':
                        break;
                    case 'List':
                        if (!is.array(value)) {
                            return validator.validate(value, 'Noop', params);
                        }
                        if (is.plainObject(property.items)) {
                            // check each item in array
                            value.forEach(function (item, arrayIndex) {
                                // check each property in spec
                                keys(property.items).forEach(function (key) {
                                    // ignore if property not in object
                                    if (!(key in item)) {
                                        return;
                                    }
                                    var prop = property.items[key];
                                    results = results.concat(
                                        DATA.validate.call(
                                            that,
                                            {
                                                type: prop.type || prop,
                                                params: prop.params || {},
                                                constraints: prop.constraints,
                                                validator: prop.validator,
                                            },
                                            path,
                                            arrayIndex,
                                            name + '.' + arrayIndex + '.' + key,
                                            item[key]
                                        )
                                    );
                                });
                            });
                        } else if (is.string(property.itemType)) {
                            // typed list
                            // check each item in array
                            value.forEach(function (item, arrayIndex) {
                                results = results.concat(
                                    DATA.validate.call(
                                        that,
                                        {
                                            type: property.itemType,
                                            params: params,
                                            constraints: property.constraints,
                                            validator: property.validator,
                                        },
                                        path,
                                        arrayIndex,
                                        name + '.' + arrayIndex,
                                        item
                                    )
                                );
                            });
                        }
                        // update value valid flags
                        value.isValid = !results.length;
                        value.validation = results;
                        break;
                    default:
                        try {
                            // log validation event
                            perf.count('blue/component', 'validate', this.name, name);
                            // validate
                            result = validator.validate(value, type, params, property);
                        } catch (e) {
                            // let someone know that the spec is bad...
                            logger.warn(
                                '[' + that.context.getStack() + ']',
                                'Unable to validate Data "' + name + '"',
                                e
                            );
                            // give fake valid results
                            result = validator.validate(value, 'Noop', params);
                        }

                        // is this a simple data property
                        if (index === undefined) {
                            return result;
                            // list type... only add invalid items
                        } else if (!result.isValid) {
                            results.push({
                                property: nameLast,
                                index: index,
                                dataPath: name,
                                result: result,
                            });
                        }
                }
                results.isValid = !results.length;
                return results;
            },
            onChange: function (name, path, value) {
                // "this" is always passed in by calling function
                var that = this,
                    property = that._('data')[name],
                    downstream = that._('ds');

                // invalidate property
                property.validated = false;

                // check for downstream filter before sending update to bridge
                if (!downstream || name in downstream) {
                    // send to bridge
                    tellBridge.call(that, name, path, value);
                }
            },
            setter: function (path, value) {
                // "this" is always passed in by calling function
                var that = this,
                    name = path.split('.')[0],
                    nested = name !== path,
                    property = that._('data')[name];
                // do we need to init the data structure?
                if (nested && !that.model.get(name) && property.definition.type === 'LIST') {
                    that._ignore = path;
                    that.model.set(name, []);
                    delete that._ignore;
                }
                // finally save the data
                that.model.set(path, value, { isolate: true });
            },
            init: function (key, definition) {
                // "this" is always passed in by calling function
                var that = this,
                    property;

                createCheck.call(that, key, { type: 'Data', undef: 1 });

                // Create data entry
                that._('data')[key] = property = createNull();

                if (definition.type && !is.string(definition.type)) {
                    throw new TypeError(
                        'data type for property ' + key + ' must be a string, not ' + typeof definition.type
                    );
                }

                // Check for custom/modified Types that must be tracked as unique Type in Validator
                validator.composeValidators(key, definition, { name: that.key });

                // Create data property, e.g. this.fooBar
                defineProperty(that, key, {
                    get: function () {
                        return that.model.get(key, { isolate: true });
                    },
                    set: function (value) {
                        return DATA.setter.call(that, key, value);
                    },
                    configurable: true,
                    enumerable: true,
                });

                // initialize validation flags
                property.definition = definition;
                property.isValid = true;
                property.validationResults = [];
            },
        },
        NAME = {
            descriptor: {
                get: function () {
                    return this._('name');
                },
                set: function (specName) {
                    if (!is.string(specName)) {
                        throw new TypeError('name must be a string');
                    }

                    if (this._('name')) {
                        throw new Error('name can only be set once');
                    }

                    this._('name', specName);
                    this._('id', '<#' + specName + ':' + ++uuid + '>');

                    this.context.componentName = this.context.name = specName;

                    // log now that we have the component id
                    perf.count.call({ id: this._('id'), ref: this, time: 1 }, 'blue/component', 'create', this.name);
                },
                configurable: true,
                enumerable: false,
            },
        },
        SETTINGS = {
            descriptor: {
                set: function (properties) {
                    // update properties object with data from CQ5 (only once)
                    !properties._init &&
                        (properties._init = true) &&
                        localeSettings.addSettingsToModel({
                            spec: {
                                name: this.name,
                                settings: properties,
                            },
                            component: this,
                        });
                    // save ref to settings spec
                    // this is only used for the object keys
                    this._('settings', properties);
                    // create setting getter/setters
                    keys(properties).forEach(function (key) {
                        key !== '_init' && SETTINGS.init.call(this, key, properties[key].value);
                    }, this);
                    // settings can only be called once...
                    // lets delete it now
                    delete this.settings;
                },
                configurable: true,
                enumerable: false,
            },
            newKind: function () {
                // TODO - check JIRA for initial addition of this feature. May need to
                // edit blue-app/localeSettings.js so that content block specific type can
                // sparsely override subset of default content strings. Current code does not
                // do that - every content key/value must be repeated for every "kind".
                var properties = this._('settings') || {},
                    model = this.model,
                    data = (model && model.get()) || {};
                // BLUEJS-3890 - allow localeSettings to be re-processed when component.kind is modified
                // update properties object with data from CQ5 (only once)
                localeSettings.addSettingsToModel({
                    spec: {
                        name: this.name,
                        settings: properties,
                    },
                    component: this,
                });
                // save ref to settings spec
                // this is only used for the object keys
                this._('settings', properties);
                keys(properties).forEach(function (key) {
                    var unknown = '{' + key + '}';
                    // only update setting if missing and not _init
                    key !== '_init' && (data[key] = properties[key].value);
                });
            },
            reset: function () {
                var model = this.model,
                    data = (model && model.get()) || {},
                    settings = this._('settings') || {};
                keys(settings).forEach(function (key) {
                    // only update setting if missing and not _init
                    key !== '_init' && data[key] === undefined && (data[key] = settings[key].value);
                });
            },
            init: function (key, value) {
                // "this" is always passed in by calling function
                var that = this;

                // validate new property
                createCheck.call(that, key, { type: 'Setting', undef: 1 });

                // initialize model value before getter/setter created
                that.model.set(key, value);

                // Create property, e.g. this.fooBar
                defineProperty(that, key, {
                    get: function () {
                        return that.model.get(key);
                    },
                    set: function (value) {
                        return that.model.set(key, value);
                    },
                    configurable: true,
                    enumerable: true,
                });
            },
        },
        STATES = {
            descriptor: {
                set: function (properties) {
                    // save ref to states spec
                    // this is only used for the object keys
                    this._('states', properties);
                    // create states getter/setters
                    keys(properties).forEach(STATES.init, this);
                    // states can only be called once...
                    // lets delete it now
                    delete this.states;
                },
                configurable: true,
                enumerable: false,
            },
            init: function (key) {
                // "this" is always passed in by calling function
                var that = this;

                // validate new property
                createCheck.call(that, key, { type: 'State', undef: 1 });

                // Create property, e.g. this.fooBar
                defineProperty(that, key, {
                    get: function () {
                        return that.model.get(key);
                    },
                    set: function (value) {
                        return that.model.set(key, value);
                    },
                    configurable: true,
                    enumerable: true,
                });
            },
        },
        MODEL = {
            descriptor: {
                get: function () {
                    return this._('model');
                },
                set: function (data) {
                    var change,
                        that = this,
                        // get ref to model
                        model = that._('model');
                    // if setting model to itself, then stop wasting my time
                    if (data && data === model) {
                        return;
                    }
                    // clean up previous model
                    if ((change = model && model.lens)) {
                        model.destroy();
                    }
                    // ensure we have some data
                    if (data === undefined || data === null) {
                        data = createNull();
                    }
                    // already a model?
                    if (is.function(data.lens)) {
                        if (data.destroyed) {
                            logger.error(
                                '[' + that.context.getStack() + ']',
                                'Tried to create-component with destroyed model'
                            );
                            data = observable.Model({}, { skipRepeats: true });
                        }
                        model = data;
                    } else {
                        model = observable.Model(data, { skipRepeats: true });
                    }
                    // listen for each property being set...
                    // don't fire immediately, wait for app to set values
                    // isolate model references from downstream consumers
                    model.onValue(MODEL.onChange, { initial: false, scope: that, isolate: true });
                    // save ref to model
                    that._('model', model);
                    // reapply settings to new model
                    change && MODEL.reset.call(that);
                },
                configurable: true,
                enumerable: false,
            },
            onChange: function (value, fullPath) {
                var that = this,
                    name = fullPath.split('.')[0],
                    hasProp = name in that,
                    newVal = value && value[name];
                if (value && !name) {
                    // we need to reapply the settings data to the model because it was blown away by the dev...
                    MODEL.reset.call(that);
                    logger.warn(
                        '[' + that.context.getStack() + ']',
                        'Component properties should be used in favor of setting directly on internal model'
                    );
                }
                if (!hasProp || that._ignore) {
                    return;
                }
                // call corresponding onChange handler
                if (name in (that._('data') || {})) {
                    // data change
                    DATA.onChange.call(that, name, fullPath, newVal);
                } else if (name in (that._('settings') || {})) {
                    // settings change
                    tellBridge.call(that, name, name, newVal);
                } else if (name in (that._('states') || {})) {
                    // settings change
                    tellBridge.call(that, name, name, newVal);
                } else {
                    // not a spec property
                    return;
                }
                // check for app code listeners
                checkListeners.call(that, fullPath, newVal);
            },
            reset: function () {
                var done;
                SETTINGS.reset.call(this);
                if (this._('enabled') || this._queueData) {
                    done = perf.count.call({ bucket: 'render' }, 'blue/component', 'emit', this.name, 'reset');
                    this.privateOutput.emtest('reset', {
                        value: 'data',
                        current: this.model.get({ isolate: true }) || {},
                    });
                    done();
                }
            },
        };

    /**
     * @function module:blue-app/component~resetOutput
     */
    function resetOutput() {
        var that = this,
            priOutput = that.privateOutput.asEventStream(),
            priUnValue = priOutput.onValue(function (event) {
                // Only collect if disabled
                if (that._('enabled')) {
                    return;
                }
                // Push events to queue
                that._('queue').push(event);
            });
        that.privateOutput && that.privateOutput.asEventStream().end();
        that.privateOutput && that.privateOutput.destroy();
        // todo: make private
        that.privateOutput = new EventChannel({
            eventTarget: that,
        });
        priOutput.onEnd(priUnValue);
    }

    /**
     * A component is a code module responsible for implementing a single business unit's UI-independent actions.
     *
     * Components are created in the application's or area's wire spec file (main.js). At the time of creation, a component is assembled using the following required pieces:
     * - _name_ - String name for the component
     * - _methods_ - Reference to the component module
     * - _component spec_ - This file is a contract for development and a bridge between business and technology: it defines the functions, data elements, content keys and application state for a given business functionality. It specifies meaningful, standard names for variables and functions within the application based on the in-house semantic models and vocabulary.
     *
     * _BlueJS Business Components_ - The component specification file is created and managed by an independent group who keep them in line with business requirements. See BlueSpec. The application developers and the BlueJS framework team do not maintain the component spec files. The application developers then write code that implements those specifications within the main.js file.
     *
     * This entity is written directly into a controller's entry in the wire spec file within a "components" object effectively assigning the created component to a controller. Every component also includes a data model. This data model is almost always determined at run time within the controller's action, so it is applied to the existing component just before that component is used in the controller.
     * @example <caption>Example Wire Spec that creates a component</caption>
     * componentTest: {
     *  spec: {
     *      // require path to component spec
     *      module: 'myapp/spec/componentTest'
     *  },
     *  methods: {
     *      // require path to component methods
     *      module: 'myapp/component/componentTest'
     *  }
     * }
     * @class module:blue-app/component
     * @param {module:blue-core/context} parentContext
     */
    var Component = function (parentContext) {
        var that = this,
            cache = {
                enabled: false,
                hasView: false,
                // BLUEJS-477: cleanup methods store
                installedHandlers: {},
                listeners: {},
                queue: [],
                // internal data store
                data: createNull(),
            };

        // apply secret getter/setter via bind to hide it's true use
        that._ = secret.bind(cache);

        that.initialized = false;
        that.defineContext(parentContext);

        // Define specification construction properties
        defineProperties(that, {
            actions: ACTION.descriptor,
            data: DATA.descriptor,
            model: MODEL.descriptor,
            name: NAME.descriptor,
            settings: SETTINGS.descriptor,
            states: STATES.descriptor,
        });

        that.key = '';

        // todo: make private
        that.output = new EventChannel({
            eventTarget: that,
        });

        // Also must collect events on main output channel since that's where app code will place messages
        var outStream = that.output.asEventStream(),
            outUnValue = outStream.onValue(function (event) {
                // Only collect if disabled
                if (that._('enabled')) {
                    return;
                }
                // Push events to queue
                that._('queue').push(event);
            });
        outStream.onEnd(outUnValue);

        resetOutput.call(that);
    };

    // support creation outside of controller
    /**
     * @function module:blue-app/component.create
     */
    Component.create = function (key, context, config) {
        // return legacy component instance if asked for
        if (config.legacy && legacyComp) {
            return legacyComp.create.apply(0, arguments);
        }

        var comp = new Component(context),
            states = config.spec.states || (config.spec.states = {}),
            props = ['actions', 'data', 'settings', 'states'],
            prop,
            kind;

        comp.key = key;
        comp.model = config.model;
        // BLUEJS-3104 - Blue Block Content Types
        comp.kind = config.kind;

        if (config.viewEngine) {
            comp.context.viewEngine = config.viewEngine;
        }

        // keep component alive when view destroyed
        comp._('keepAlive', config.keepAlive);
        comp._('modelCleanup', config.modelCleanup);

        // config.methods a mixin?
        if (is.function(config.methods)) {
            config.methods.call(comp, comp.context);
            // config.methods an object of methods?
        } else if (is.plainObject(config.methods)) {
            keys(config.methods).forEach(function (name) {
                isReservedWord(name, comp.context);
                comp[name] = config.methods[name];
            });
        }

        // BLUEJS-1782 - add internal version setting
        states.v = 1;

        // BLUEJS-3574 - Set logger
        comp.context.logger = getLogger('[component:' + config.spec.name + ']');

        // apply each spec prop to the component
        compose(comp, config.spec);

        /* deprecate the controller property*/
        defineProperties(comp, {
            __hasView: {
                get: function () {
                    logger.warn(
                        '[' + this.context.getStack() + ']',
                        'DEPRECATED:BLUEJS-2918:Property: "__hasView" has been deprecated.'
                    );
                    return this._('hasView');
                },
            },
            __instanceName: {
                get: function () {
                    logger.warn(
                        '[' + this.context.getStack() + ']',
                        'DEPRECATED:BLUEJS-2918:Property: "__instanceName" has been deprecated. Use "key"'
                    );
                    return this.key;
                },
            },
            spec: {
                get: function () {
                    // logger.warn('[' + this.context.getStack() + ']','Property: "spec" has been deprecated.');
                    return config.spec;
                },
            },
        });

        // stuff that was converted to "private"
        ['__viewName', '__enabled'].forEach(function (item) {
            defineProperty(comp, item, {
                get: function () {
                    var value = this._(item.replace(/[^a-z]/gi, ''));
                    logger.warn(
                        '[' + this.context.getStack() + ']',
                        'DEPRECATED:BLUEJS-2918:Property: "' + item + '" has been deprecated.',
                        value
                    );
                    return value;
                },
            });
        });

        // remove any remaining setters
        while ((prop = props.pop())) {
            delete comp[prop];
        } // eslint-disable-line no-cond-assign

        // execute init
        comp.initialized = true;

        if (comp.onInit) {
            execFunc.call(comp, 'onInit');
        } else if (comp.init) {
            execFunc.call(comp, 'init');
        }
        comp.privateOutput.emtest('init', {});
        execFunc.call(comp, 'onComplete');
        comp.privateOutput.emtest('complete', {});

        // BLUEJS-3890 - support setting new component "kind" after creation of component, forces
        // reset of SETTINGS values in component model.
        kind = comp.kind;
        defineProperty(comp, 'kind', {
            get: function () {
                return kind;
            },
            set: function (newKind) {
                if (newKind !== kind) {
                    kind = newKind;
                    SETTINGS.newKind.call(comp);
                }
            },
        });

        return comp;
    };

    // clear inherited object prototype
    Component.prototype = createNull();

    Component.prototype.constructor = Component;

    Component.prototype.destroy = function () {
        var that = this;
        that.actionRunning && that.privateOutput && that.privateOutput.emtest('action', that.actionRunning);
        that.privateOutput && that.privateOutput.emtest('destroy', {});
        // BLUEJS-3372 - mark component as destroyed before beginning large asynchronous process
        that.destroyed = true;
        // create destruction promise
        var destroyPromise = new Promise(function (resolve, reject) {
            // destroy view first
            that.disable(resolve, reject, true);
        })
            .catch(function () {})
            .then(function () {
                // clean up model
                that.model && that.model.destroy(that._('modelCleanup') && that.context);
                // announce component destruction
                that.context && that.context.bubble('removeComponent', { name: that.key });
                // cleanup com channels
                that.output && that.output.destroy();
                that.privateOutput && that.privateOutput.destroy();
                delete that.output;
                delete that.privateOutput;
                // call onDestroy handler if defined
                execFunc.call(that, 'onDestroy');
                that.context && that.destroyContext();
                perf.count.call({ id: that._('id') }, 'blue/component', 'destroy', that.name);
                // remove references to all private data
                that._();
            });
        return destroyPromise;
    };

    Component.prototype.destroyView = function (compDestroyResolve, compDestroyReject) {
        var unsubFunction,
            handlers = this._('installedHandlers');
        if (!this._('hasView')) {
            return;
        }
        this._('hasView', false);
        // stop listening for view's "I'm shutting down" message to prevent looping
        if (is.array(handlers.destroy)) {
            while ((unsubFunction = handlers.destroy.pop())) {
                unsubFunction();
            }
        }
        this.privateOutput &&
            this.privateOutput.emtest('destroyView', {
                compDestroyResolve: compDestroyResolve,
                compDestroyReject: compDestroyReject,
            });
    };

    // todo: make private
    Component.prototype.disable = function (compDestroyResolve, compDestroyReject, destroying) {
        var unbinderGroup,
            unsubFunction,
            handlers = this._('installedHandlers');
        if (this._('hasView')) {
            // resolve component.destroy when view is finished destroying
            this.destroyView(compDestroyResolve, compDestroyReject);
        } else {
            // no view remains, so resolve component.destroy immediately
            compDestroyResolve && compDestroyResolve();
        }
        if (!this._('enabled')) {
            return;
        }

        // BLUEJS-649 - Force this component's output channel to unplug from componentChannel
        handlers.outputUnplugger && handlers.outputUnplugger();
        delete handlers.outputUnplugger;

        !destroying && resetOutput.call(this);
        this._('enabled', false);
        this.input = undefined;

        // BLUEJS-477: call unbinders
        keys(handlers).forEach(function (key) {
            unbinderGroup = handlers[key];
            if (is.function(unbinderGroup)) {
                unbinderGroup();
            } else if (is.array(unbinderGroup)) {
                while ((unsubFunction = unbinderGroup.pop())) {
                    // eslint-disable-line no-cond-assign
                    is.function(unsubFunction) && unsubFunction();
                }
            }
            delete handlers[key];
        });
    };

    // todo: make private
    Component.prototype.enable = function (input) {
        var done,
            that = this,
            queue = that._('queue'),
            handlers = that._('installedHandlers'),
            item;

        if (that.destroyed) {
            return;
        }

        // clean up if we are already listening for events
        that.disable();

        // todo: make private
        that.input = input;

        // listen to bridge for actions to execute
        handlers.trigger = that.input.on('trigger', function (event) {
            var methodName = event.value;
            if (that[methodName]) {
                logger.error(
                    '[' + that.context.getStack() + ']',
                    'Action: ' + methodName + '() does not exist in spec'
                );
                return;
            }
            try {
                if (event.data && event.data.constructor === Array) {
                    that[methodName].apply(that, event.data);
                } else {
                    that[methodName].call(that, event.data);
                }
            } catch (e) {
                logger.error('[' + that.context.getStack() + ']', 'Action: ' + methodName + '()', e);
            }
        });

        // listen to bridge for value changes
        handlers.binding = that.input.on('binding', function (event) {
            var topPropName = event.value.split('.')[0];
            if (!(topPropName in that)) {
                logger.error(
                    '[' + that.context.getStack() + ']',
                    'Property: ' + topPropName + ' does not exist in spec'
                );
                return;
            }
            // set flag so this isn't sent back to the bridge
            that._fromBridge = event.value;
            // update model
            DATA.setter.call(that, event.value, event.data);
            // clear flag
            delete that._fromBridge;
        });

        // listen for downstream property filter
        handlers.bindingInit = that.input.on('init', function (event) {
            that._('ds', event.downstream);
        });

        handlers.destroy = that.input.on('destroy', function () {
            that._('hasView', false);
            // destroy component with view, unless keepAlive
            if (that._('keepAlive')) {
                that.destroy();
            } else {
                that.disable();
            }
        });

        handlers.ready = that.input.on('ready', function () {
            that._('hasView', true);
            that.privateOutput.emtest('ready', {
                componentName: that.name,
                componentInstanceName: that.key || '',
                componentId: that._('id'),
                viewName: that._('viewName') || '',
            });
            // call onReady handler if defined
            execFunc.call(that, 'onReady');
        });

        that._('enabled', true);
        handlers.outputUnplugger = that.output.plug(that.privateOutput.asEventStream());

        that.privateOutput.emtest('componentInputReady');

        done = perf.count.call({ bucket: 'render' }, 'blue/component', 'emit', that.name, 'enable');
        while (queue.length) {
            // at the event when component is ready, empty queue except for bindings
            item = queue.shift();
            if (item.type === 'binding') {
                continue;
            }
            that.output.emit(item);
        }
        done();
        delete that._queueData;
    };

    Component.prototype.onData = function (path, handler, config) {
        var id = 'n' + uuid++,
            listeners = this._('listeners'),
            name = path.split('.')[0],
            cfg = config || {},
            handlerCfg = { h: handler, s: cfg.context || this },
            handlers = listeners[name] || (listeners[name] = {});
        // save handler
        handlers[id] = handlerCfg;
        // should we fire now?
        if (!('init' in cfg) || cfg.init) {
            try {
                handlerCfg.h.call(handlerCfg.s, this[name], name);
            } catch (ex) {
                logger.error('[' + this.context.getStack() + ']', 'Calling "' + name + '" data-change listener', ex);
            }
        }
        return function () {
            delete handlers[id];
        };
    };

    Component.prototype.validate = function (name) {
        var that = this,
            data = this._('data'),
            model = that.model,
            results = {
                isValid: true,
                updated: {},
                passed: {},
                failed: {},
            },
            names = !name
                ? keys(data) // jshint ignore:line
                : is.array(name)
                  ? name // jshint ignore:line
                  : name in data
                    ? [name] // jshint ignore:line
                    : [];

        names.forEach(function (prop) {
            var isValid,
                property = data[prop] || {},
                definition = property.definition || {},
                type = definition.type || 'Noop';
            // ignore untyped, Noop, and NoConstraint types
            if ({ Noop: 1, NoConstraint: 1 }[type] && !definition.validator) {
                property.isValid = isValid = true;
                // already validated?
            } else if (property.validated) {
                isValid = property.isValid;
            } else {
                // validate property
                property.validationResults = DATA.validate.call(
                    that,
                    definition,
                    prop,
                    undefined,
                    prop,
                    model.get(prop)
                );
                property.isValid = isValid = property.validationResults.isValid;
                property.validated = true;
                results.updated[prop] = true;
            }
            results.isValid &= isValid; // jshint ignore:line
            results[isValid ? 'passed' : 'failed'][prop] = property.validationResults;
        });

        return results;
    };

    Component.prototype.getSettingsValues = function () {
        var obj = {},
            settings = this._('settings');
        settings &&
            keys(settings).forEach(function (name) {
                obj[name] = this.model.get(name);
            }, this);
        return obj;
    };

    Component.prototype.getActionNames = function () {
        var obj = {},
            actions = this._('actions');
        actions &&
            keys(actions).forEach(function (name) {
                obj[name] = 1;
            }, this);
        return obj;
    };

    /**
     * @description Subscribe to events on the component's local Channel. Events on the
     *              local channel are not visible to other components or the main
     *              ComponentChannel.
     * @function
     * @param {String|PlainObject} [eventType] The type of event.
     * @param {Function} [callback] The callback to execute when the event is published.
     * @example
     * // Execute callback for ALL events on the component (no eventType given)
     * myComponent.on(function(event) {
     *     // Analyze, log, etc the event
     * });
     *
     * // Execute callback for a component-generated event
     * // Format of eventType is ACTION/VALUE
     * // ACTION - function call, state change, etc on the component
     * // VALUE - name of action, property name, etc.
     *
     * // Note: TARGET is automatically prepended to the eventType and
     * //       is equal to the name of the component as defined in the spec
     * myComponent.on('action/submit', function(event) {
     *     // Execute logic for the submit action on the component
     * });
     *
     * // Subscribe to multiple events
     * myComponent.on({
     *     'action/submit': function(submitEvent) {
     *         // Business Logic
     *     },
     *     'state/enabled': function(enabledEvent) {
     *         // Business Logic
     *     },
     *     'action/requestBalance': function(requestEvent) {
     *         // Business Logic
     *     },
     *     'state/valid': function(validEvent) {
     *         // Business Logic
     *     }
     * });
     *
     * // Can use wildcards
     * myComponent.on('action/*', function(actionEvent) {
     *     // Logic for all actions on the component
     * });
     */
    Component.prototype.on = function (eventType, callback) {
        var parts, newkey;
        if (this._('enabled')) {
            // Prepend the name of the current component
            // Dev's format is "action/submit"
            // Internal format is "auth/action/submit"
            if (!is.string(eventType) && is.object(eventType)) {
                map(
                    eventType,
                    function (v, k) {
                        parts = k.split('/');
                        parts.unshift(this.name);
                        newkey = parts.join('/');
                        eventType[newkey] = v;
                        delete eventType[k];
                    },
                    this
                );
            } else {
                parts = eventType.split('/');
                parts.unshift(this.name);
                eventType = parts.join('/');
            }

            this.output.on(eventType, callback);
        }
    };

    // add serializable functionality
    asSerializable.call(Component.prototype, function () {
        return {
            CompID: this._('id') || 'empty id',
            specName: this.name || 'no spec name',
            model: this.model.toJSON(this.spec.data).model || 'empty model',
        };
    });

    // mix context into component
    Component = asContextual.call(Component, { name: 'component' });

    return Component;
});
