(function webpackUniversalModuleDefinition(root, factory) {
    if (typeof exports === 'object' && typeof module === 'object')
        module.exports = factory(require('@blue/core'), require('@blue/util'), require('@blue/context'));
    else if (typeof define === 'function' && define.amd) define(['@blue/core', '@blue/util', '@blue/context'], factory);
    else if (typeof exports === 'object')
        exports['blue-model'] = factory(require('@blue/core'), require('@blue/util'), require('@blue/context'));
    else root['blue-model'] = factory(root['@blue/core'], root['@blue/util'], root['@blue/context']);
})(
    globalThis,
    function (__WEBPACK_EXTERNAL_MODULE__11__, __WEBPACK_EXTERNAL_MODULE__12__, __WEBPACK_EXTERNAL_MODULE__14__) {
        return /******/ (() => {
            // webpackBootstrap
            /******/ 'use strict';
            /******/ var __webpack_modules__ = [
                ,
                /* 0 */ /* 1 */
                /***/ (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {
                    __webpack_require__.r(__webpack_exports__);
                    /* harmony import */ var _object_model_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
                    /* harmony import */ var _array_model_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
                    /* harmony import */ var _set_model_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6);
                    /* harmony import */ var _map_model_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(7);
                    /* harmony import */ var _function_model_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(8);
                    /* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(3);

                    const styles = {
                        list: 'list-style-type: none; padding: 0; margin: 0;',
                        listItem: 'padding: 0 0 0 1em;',
                        model: 'color: #3e999f;',
                        instance: 'color: #718c00; font-style: italic',
                        function: 'color: #4271AE',
                        string: 'color: #C41A16',
                        number: 'color: #1C00CF',
                        boolean: 'color: #AA0D91',
                        property: 'color: #8959a8',
                        private: 'color: #C19ED8',
                        constant: 'color: #8959a8; font-weight: bold',
                        privateConstant: 'color: #C19ED8; font-weight: bold',
                        null: 'color: #8e908c',
                        undeclared: 'color: #C0C0C0;',
                        proto: 'color: #B871BD; font-style: italic',
                    };

                    const getModel = (instance) => {
                        if (instance === undefined || instance === null) return null;

                        const proto = (0, _helpers_js__WEBPACK_IMPORTED_MODULE_5__.getProto)(instance);
                        if (
                            !proto ||
                            !proto.constructor ||
                            !(0, _helpers_js__WEBPACK_IMPORTED_MODULE_5__.is)(
                                _object_model_js__WEBPACK_IMPORTED_MODULE_0__.Model,
                                proto.constructor
                            )
                        )
                            return null;

                        return proto.constructor;
                    };

                    const span = (style, ...children) => ['span', { style }, ...children];

                    const format = (x, config = {}) => {
                        if (x === null || x === undefined) return span(styles.null, '' + x);

                        if (typeof x === 'boolean') return span(styles.boolean, x);

                        if (typeof x === 'number') return span(styles.number, x);

                        if (typeof x === 'string') return span(styles.string, `"${x}"`);

                        if (Array.isArray(x) && config.isModelDefinition) {
                            return span('', ...x.flatMap((part) => [format(part, config), ' or ']).slice(0, -1));
                        }

                        if ((0, _helpers_js__WEBPACK_IMPORTED_MODULE_5__.isPlainObject)(x))
                            return formatObject(x, getModel(x), config);

                        if (
                            (0, _helpers_js__WEBPACK_IMPORTED_MODULE_5__.isFunction)(x) &&
                            !(0, _helpers_js__WEBPACK_IMPORTED_MODULE_5__.is)(
                                _object_model_js__WEBPACK_IMPORTED_MODULE_0__.Model,
                                x
                            ) &&
                            config.isModelDefinition
                        )
                            return span(styles.function, x.name || x.toString());

                        return ['object', { object: x, config }];
                    };

                    const formatObject = (o, model, config) =>
                        span(
                            '',
                            '{',
                            [
                                'ol',
                                { style: styles.list },
                                ...Object.keys(o).map((prop) => [
                                    'li',
                                    { style: styles.listItem },
                                    span(styles.property, prop),
                                    ': ',
                                    format(o[prop], config),
                                ]),
                            ],
                            '}'
                        );

                    const formatModel = (model) => {
                        const cfg = { isModelDefinition: true },
                            def = model.definition,
                            formatList = (list, map) => list.flatMap((e) => [map(e), ', ']).slice(0, -1);
                        let parts = [];

                        if (
                            (0, _helpers_js__WEBPACK_IMPORTED_MODULE_5__.is)(
                                _object_model_js__WEBPACK_IMPORTED_MODULE_0__.BasicModel,
                                model
                            )
                        )
                            parts = [format(def, cfg)];
                        if (
                            (0, _helpers_js__WEBPACK_IMPORTED_MODULE_5__.is)(
                                _array_model_js__WEBPACK_IMPORTED_MODULE_1__['default'],
                                model
                            )
                        )
                            parts = ['Array of ', format(def, cfg)];
                        if (
                            (0, _helpers_js__WEBPACK_IMPORTED_MODULE_5__.is)(
                                _set_model_js__WEBPACK_IMPORTED_MODULE_2__['default'],
                                model
                            )
                        )
                            parts = ['Set of ', format(def, cfg)];
                        if (
                            (0, _helpers_js__WEBPACK_IMPORTED_MODULE_5__.is)(
                                _map_model_js__WEBPACK_IMPORTED_MODULE_3__['default'],
                                model
                            )
                        )
                            parts = ['Map of ', format(def.key, cfg), ' : ', format(def.value, cfg)];
                        if (
                            (0, _helpers_js__WEBPACK_IMPORTED_MODULE_5__.is)(
                                _function_model_js__WEBPACK_IMPORTED_MODULE_4__['default'],
                                model
                            )
                        ) {
                            parts = ['Function(', ...formatList(def.arguments, (arg) => format(arg, cfg)), ')'];
                            if ('return' in def) parts.push(' => ', format(def.return, cfg));
                        }

                        if (model.assertions.length > 0) {
                            parts.push(
                                '\n(assertions: ',
                                ...formatList(model.assertions, (f) => ['object', { object: f }]),
                                ')'
                            );
                        }

                        return span(styles.model, ...parts);
                    };

                    const ModelFormatter = {
                        header(x, config = {}) {
                            if (x === _object_model_js__WEBPACK_IMPORTED_MODULE_0__.Any)
                                return span(styles.model, 'Any');

                            if (
                                (0, _helpers_js__WEBPACK_IMPORTED_MODULE_5__.is)(
                                    _object_model_js__WEBPACK_IMPORTED_MODULE_0__.Any.remaining,
                                    x
                                )
                            )
                                return span(styles.model, '...', format(x.definition, { isModelDefinition: true }));

                            if (
                                (0, _helpers_js__WEBPACK_IMPORTED_MODULE_5__.is)(
                                    _object_model_js__WEBPACK_IMPORTED_MODULE_0__.ObjectModel,
                                    x
                                )
                            )
                                return span(styles.model, x.name);

                            if (
                                (0, _helpers_js__WEBPACK_IMPORTED_MODULE_5__.is)(
                                    _object_model_js__WEBPACK_IMPORTED_MODULE_0__.Model,
                                    x
                                )
                            ) {
                                return formatModel(x);
                            }

                            if (
                                config.isModelDefinition &&
                                (0, _helpers_js__WEBPACK_IMPORTED_MODULE_5__.isPlainObject)(x)
                            )
                                return format(x, config);

                            return null;
                        },
                        hasBody(x) {
                            return (0, _helpers_js__WEBPACK_IMPORTED_MODULE_5__.is)(
                                _object_model_js__WEBPACK_IMPORTED_MODULE_0__.ObjectModel,
                                x
                            );
                        },
                        body(model) {
                            return span(
                                '',
                                '{',
                                [
                                    'ol',
                                    { style: styles.list },
                                    ...Object.keys(model.definition).map((prop) => {
                                        const isPrivate = model.conventionForPrivate(prop);
                                        const isConstant = model.conventionForConstant(prop);
                                        const hasDefault =
                                            model.default &&
                                            (0, _helpers_js__WEBPACK_IMPORTED_MODULE_5__.has)(model.default, prop);
                                        let style = styles.property;

                                        if (isPrivate) {
                                            style = isConstant ? styles.privateConstant : styles.private;
                                        } else if (isConstant) {
                                            style = styles.constant;
                                        }

                                        return [
                                            'li',
                                            { style: styles.listItem },
                                            span(style, prop),
                                            ': ',
                                            format(model.definition[prop], { isModelDefinition: true }),
                                            hasDefault ? span(styles.proto, ' = ', format(model.default[prop])) : '',
                                        ];
                                    }),
                                ],
                                '}'
                            );
                        },
                    };

                    const ModelInstanceFormatter = {
                        header(x, config = {}) {
                            if (
                                config.isInstanceProperty &&
                                (0, _helpers_js__WEBPACK_IMPORTED_MODULE_5__.isPlainObject)(x)
                            ) {
                                return format(x, config);
                            }

                            const model = getModel(x);
                            if (
                                (0, _helpers_js__WEBPACK_IMPORTED_MODULE_5__.is)(
                                    _object_model_js__WEBPACK_IMPORTED_MODULE_0__.Model,
                                    model
                                )
                            ) {
                                const parts = (0, _helpers_js__WEBPACK_IMPORTED_MODULE_5__.is)(
                                    _object_model_js__WEBPACK_IMPORTED_MODULE_0__.ObjectModel,
                                    model
                                )
                                    ? [model.name]
                                    : [
                                          [
                                              'object',
                                              { object: x[_object_model_js__WEBPACK_IMPORTED_MODULE_0__._original] },
                                          ],
                                          ` (${model.name})`,
                                      ];
                                return span(styles.instance, ...parts);
                            }

                            return null;
                        },
                        hasBody(x) {
                            return (
                                x &&
                                (0, _helpers_js__WEBPACK_IMPORTED_MODULE_5__.is)(
                                    _object_model_js__WEBPACK_IMPORTED_MODULE_0__.ObjectModel,
                                    getModel(x)
                                )
                            );
                        },
                        body(x) {
                            const model = getModel(x);
                            const o = x[_object_model_js__WEBPACK_IMPORTED_MODULE_0__._original] || x;
                            return span(
                                '',
                                '{',
                                [
                                    'ol',
                                    { style: styles.list },
                                    ...Object.keys(o).map((prop) => {
                                        const isPrivate = model.conventionForPrivate(prop);
                                        const isConstant = model.conventionForConstant(prop);
                                        const isDeclared = prop in model.definition;
                                        let style = styles.property;

                                        if (!isDeclared) {
                                            style = styles.undeclared;
                                        } else if (isPrivate) {
                                            style = isConstant ? styles.privateConstant : styles.private;
                                        } else if (isConstant) {
                                            style = styles.constant;
                                        }

                                        return [
                                            'li',
                                            { style: styles.listItem },
                                            span(style, prop),
                                            ': ',
                                            format(o[prop], { isInstanceProperty: true }),
                                        ];
                                    }),
                                    [
                                        'li',
                                        { style: styles.listItem },
                                        span(styles.proto, '__proto__', ': ', [
                                            'object',
                                            { object: (0, _helpers_js__WEBPACK_IMPORTED_MODULE_5__.getProto)(x) },
                                        ]),
                                    ],
                                ],
                                '}'
                            );
                        },
                    };

                    if (typeof window !== 'undefined') {
                        window.devtoolsFormatters = (window.devtoolsFormatters || []).concat(
                            ModelFormatter,
                            ModelInstanceFormatter
                        );
                    }

                    /***/
                },
                /* 2 */
                /***/ (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {
                    __webpack_require__.r(__webpack_exports__);
                    /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                        /* harmony export */ _check: () => /* binding */ _check,
                        /* harmony export */ _checked: () => /* binding */ _checked,
                        /* harmony export */ _original: () => /* binding */ _original,
                        /* harmony export */ CHECK_ONCE: () => /* binding */ CHECK_ONCE,
                        /* harmony export */ initModel: () => /* binding */ initModel,
                        /* harmony export */ initObjectModel: () => /* binding */ initObjectModel,
                        /* harmony export */ extendModel: () => /* binding */ extendModel,
                        /* harmony export */ stackError: () => /* binding */ stackError,
                        /* harmony export */ unstackErrors: () => /* binding */ unstackErrors,
                        /* harmony export */ isModelInstance: () => /* binding */ isModelInstance,
                        /* harmony export */ parseDefinition: () => /* binding */ parseDefinition,
                        /* harmony export */ formatDefinition: () => /* binding */ formatDefinition,
                        /* harmony export */ formatAssertions: () => /* binding */ formatAssertions,
                        /* harmony export */ extendDefinition: () => /* binding */ extendDefinition,
                        /* harmony export */ check: () => /* binding */ check,
                        /* harmony export */ checkDefinition: () => /* binding */ checkDefinition,
                        /* harmony export */ checkDefinitionPart: () => /* binding */ checkDefinitionPart,
                        /* harmony export */ checkAssertions: () => /* binding */ checkAssertions,
                        /* harmony export */ format: () => /* binding */ format,
                        /* harmony export */ formatPath: () => /* binding */ formatPath,
                        /* harmony export */ controlMutation: () => /* binding */ controlMutation,
                        /* harmony export */ cannot: () => /* binding */ cannot,
                        /* harmony export */ cast: () => /* binding */ cast,
                        /* harmony export */ getProp: () => /* binding */ getProp,
                        /* harmony export */ getTraps: () => /* binding */ getTraps,
                        /* harmony export */ Model: () => /* binding */ Model,
                        /* harmony export */ BasicModel: () => /* binding */ BasicModel,
                        /* harmony export */ ObjectModel: () => /* binding */ ObjectModel,
                        /* harmony export */ Any: () => /* binding */ Any,
                        /* harmony export */
                    });
                    /* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);

                    const _check = Symbol(),
                        _checked = Symbol(), // used to skip validation at instanciation for perf
                        _original = Symbol(), // used to bypass proxy
                        CHECK_ONCE = Symbol(),
                        initModel = (def, constructor, parent, init, getTraps, useNew) => {
                            const model = function (val = model.default, mode) {
                                if (useNew && !(0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.is)(model, this))
                                    return new model(val);
                                if (init) val = init(val, model, this);

                                if (mode === _checked || check(model, val))
                                    return getTraps && mode !== CHECK_ONCE
                                        ? (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.proxify)(val, getTraps(model))
                                        : val;
                            };

                            if (parent) (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.extend)(model, parent);
                            (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.setProto)(model, constructor.prototype);
                            model.constructor = constructor;
                            model.definition = def;
                            model.assertions = [...model.assertions];
                            (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.define)(model, 'errors', []);
                            delete model.name;
                            return model;
                        },
                        initObjectModel = (obj, model, _this) => {
                            if ((0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.is)(model, obj)) return obj;

                            if (
                                !(0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(obj) &&
                                !(0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(obj) &&
                                obj !== undefined
                            ) {
                                stackError(model.errors, Object, obj);
                            }

                            (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.merge)(_this, model.default);
                            if (model.parentClass)
                                (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.merge)(obj, new model.parentClass(obj));
                            (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.merge)(_this, obj);
                            return _this;
                        },
                        extendModel = (child, parent, newProps) => {
                            (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.extend)(child, parent, newProps);
                            child.assertions.push(...parent.assertions);
                            return child;
                        },
                        stackError = (errors, expected, received, path, message) => {
                            errors.push({ expected, received, path, message });
                        },
                        unstackErrors = (model, collector = model.errorCollector) => {
                            const nbErrors = model.errors.length;
                            if (nbErrors > 0) {
                                const errors = model.errors.map((err) => {
                                    if (!err.message) {
                                        err.message =
                                            'expecting ' +
                                            (err.path ? err.path + ' to be ' : '') +
                                            formatDefinition(err.expected) +
                                            ', got ' +
                                            (err.received != null
                                                ? (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.bettertypeof)(
                                                      err.received
                                                  ) + ' '
                                                : '') +
                                            format(err.received);
                                    }
                                    return err;
                                });

                                model.errors.length = 0;
                                collector.call(model, errors); // throw all errors collected
                            }
                            return nbErrors;
                        },
                        isModelInstance = (i) =>
                            i &&
                            (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.getProto)(i) &&
                            (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.is)(
                                Model,
                                (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.getProto)(i).constructor
                            ),
                        parseDefinition = (def) => {
                            if ((0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.isPlainObject)(def)) {
                                def = {};
                                for (let key in def) {
                                    def[key] = parseDefinition(def[key]);
                                }
                            } else if (!Array.isArray(def)) return [def];
                            else if (def.length === 1) return [def[0], undefined, null];

                            return def;
                        },
                        formatDefinition = (def, stack) => {
                            const parts = parseDefinition(def).map((d) => format(d, stack));
                            return parts.length > 1 ? parts.join(' or ') : parts[0];
                        },
                        formatAssertions = (fns) =>
                            fns.length ? `(${fns.map((f) => f.name || f.description || f)})` : '',
                        extendDefinition = (def, newParts = []) => {
                            if (newParts.length > 0) {
                                def = []
                                    .concat(def, ...[].concat(newParts)) // clone to lose ref
                                    .filter((value, index, self) => self.indexOf(value) === index); // remove duplicates
                            }

                            return def;
                        },
                        check = (model, obj) => {
                            model[_check](obj, null, model.errors, [], true);
                            return !unstackErrors(model);
                        },
                        checkDefinition = (obj, def, path, errors, stack, shouldCast) => {
                            const indexFound = stack.indexOf(def);
                            if (indexFound !== -1 && stack.indexOf(def, indexFound + 1) !== -1) return obj; // if found twice in call stack, cycle detected, skip validation

                            if (Array.isArray(def) && def.length === 1 && obj != null) {
                                def = def[0]; // shorten validation path for optionals
                            }

                            if ((0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.is)(Model, def)) {
                                if (shouldCast) obj = cast(obj, def);
                                def[_check](obj, path, errors, stack.concat(def));
                            } else if ((0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.isPlainObject)(def)) {
                                for (let key in def) {
                                    const val = obj ? obj[key] : undefined;
                                    checkDefinition(val, def[key], formatPath(path, key), errors, stack, shouldCast);
                                }
                            } else {
                                const pdef = parseDefinition(def);
                                if (pdef.some((part) => checkDefinitionPart(obj, part, path, stack))) {
                                    return shouldCast ? cast(obj, def) : obj;
                                }

                                stackError(errors, def, obj, path);
                            }

                            return obj;
                        },
                        checkDefinitionPart = (obj, def, path, stack, shouldCast) => {
                            if (def === Any) return true;
                            if (obj == null) return obj === def;
                            if (
                                (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.isPlainObject)(def) ||
                                (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.is)(Model, def)
                            ) {
                                // object or model as part of union type
                                const errors = [];
                                checkDefinition(obj, def, path, errors, stack, shouldCast);
                                return !errors.length;
                            }
                            if ((0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.is)(RegExp, def)) return def.test(obj);
                            if (def === Number || def === Date) return obj.constructor === def && !isNaN(obj);
                            return (
                                obj === def ||
                                ((0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(def) &&
                                    (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.is)(def, obj)) ||
                                obj.constructor === def
                            );
                        },
                        checkAssertions = (obj, model, path, errors = model.errors) => {
                            for (let assertion of model.assertions) {
                                let result;
                                try {
                                    result = assertion.call(model, obj);
                                } catch (err) {
                                    result = err;
                                }
                                if (result !== true) {
                                    const onFail = (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(
                                        assertion.description
                                    )
                                        ? assertion.description
                                        : (assertionResult, value) =>
                                              `assertion "${assertion.description}" returned ${format(assertionResult)} ` +
                                              `for ${path ? path + ' =' : 'value'} ${format(value)}`;
                                    stackError(errors, assertion, obj, path, onFail.call(model, result, obj, path));
                                }
                            }
                        },
                        format = (obj, stack = []) => {
                            if (stack.length > 15 || stack.includes(obj)) return '...';
                            if (obj === null || obj === undefined) return String(obj);
                            if ((0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.isString)(obj)) return `"${obj}"`;
                            if ((0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.is)(Model, obj))
                                return obj.toString(stack);

                            stack.unshift(obj);

                            if ((0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(obj))
                                return obj.name || obj.toString();
                            if (
                                (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.is)(Map, obj) ||
                                (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.is)(Set, obj)
                            )
                                return format([...obj]);
                            if (Array.isArray(obj)) return `[${obj.map((item) => format(item, stack)).join(', ')}]`;
                            if (
                                obj.toString &&
                                obj.toString !== _helpers_js__WEBPACK_IMPORTED_MODULE_0__.ObjectProto.toString
                            )
                                return obj.toString();
                            if ((0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(obj)) {
                                const props = Object.keys(obj),
                                    indent = '\t'.repeat(stack.length);
                                return `{${props
                                    .map((key) => `\n${indent + key}: ${format(obj[key], [...stack])}`)
                                    .join(', ')} ${props.length ? `\n${indent.slice(1)}` : ''}}`;
                            }

                            return String(obj);
                        },
                        formatPath = (path, key) => (path ? path + '.' + key : key),
                        controlMutation = (model, def, path, o, key, privateAccess, applyMutation) => {
                            const newPath = formatPath(path, key),
                                isPrivate = model.conventionForPrivate(key),
                                isConstant = model.conventionForConstant(key),
                                isOwnProperty = (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.has)(o, key),
                                initialPropDescriptor = isOwnProperty && Object.getOwnPropertyDescriptor(o, key);

                            if (key in def && ((isPrivate && !privateAccess) || (isConstant && o[key] !== undefined)))
                                cannot(`modify ${isPrivate ? 'private' : 'constant'} property ${key}`, model);

                            applyMutation();
                            if ((0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.has)(def, key))
                                checkDefinition(o[key], def[key], newPath, model.errors, []);
                            checkAssertions(o, model, newPath);

                            const nbErrors = model.errors.length;
                            if (nbErrors) {
                                if (isOwnProperty) Object.defineProperty(o, key, initialPropDescriptor);
                                else delete o[key]; // back to the initial property defined in prototype chain

                                unstackErrors(model);
                            }

                            return !nbErrors;
                        },
                        cannot = (msg, model) => {
                            model.errors.push({ message: 'cannot ' + msg });
                        },
                        cast = (obj, defNode = []) => {
                            if (
                                !obj ||
                                (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.isPlainObject)(defNode) ||
                                (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.is)(BasicModel, defNode) ||
                                isModelInstance(obj)
                            )
                                return obj; // no value or not leaf or already a model instance

                            const def = parseDefinition(defNode),
                                suitableModels = [];

                            for (let part of def) {
                                if (
                                    (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.is)(Model, part) &&
                                    !(0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.is)(BasicModel, part) &&
                                    part.test(obj)
                                )
                                    suitableModels.push(part);
                            }

                            if (suitableModels.length === 1) {
                                // automatically cast to suitable model when explicit (autocasting)
                                return new suitableModels[0](obj, _checked);
                            }

                            if (suitableModels.length > 1)
                                console.warn(
                                    `Ambiguous model for value ${format(obj)}, could be ${suitableModels.join(' or ')}`
                                );

                            return obj;
                        },
                        getProp = (val, model, def, path, privateAccess) => {
                            if (!(0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.isPlainObject)(def))
                                return cast(val, def);
                            return (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.proxify)(
                                val,
                                getTraps(model, def, path, privateAccess)
                            );
                        },
                        getTraps = (model, def, path, privateAccess) => {
                            const grantPrivateAccess = (f) =>
                                (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.proxify)(f, {
                                    apply(fn, ctx, args) {
                                        privateAccess = true;
                                        const result = Reflect.apply(fn, ctx, args);
                                        privateAccess = false;
                                        return result;
                                    },
                                });

                            return {
                                get(o, key) {
                                    if (key === _original) return o;

                                    if (!(0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.isString)(key))
                                        return Reflect.get(o, key);

                                    const newPath = formatPath(path, key);
                                    const inDef = (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.has)(def, key);
                                    const defPart = def[key];

                                    if (!privateAccess && inDef && model.conventionForPrivate(key)) {
                                        cannot(`access to private property ${newPath}`, model);
                                        unstackErrors(model);
                                        return;
                                    }

                                    let value = o[key];

                                    if (
                                        inDef &&
                                        value &&
                                        (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.has)(o, key) &&
                                        !(0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.isPlainObject)(defPart) &&
                                        !isModelInstance(value)
                                    ) {
                                        Reflect.set(o, key, (value = cast(value, defPart))); // cast nested models
                                    }

                                    if (
                                        (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(value) &&
                                        key !== 'constructor' &&
                                        !privateAccess
                                    ) {
                                        return grantPrivateAccess(value);
                                    }

                                    if (
                                        (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.isPlainObject)(defPart) &&
                                        !value
                                    ) {
                                        o[key] = value = {}; // null-safe traversal
                                    }

                                    return getProp(value, model, defPart, newPath, privateAccess);
                                },

                                set(o, key, val) {
                                    return controlMutation(model, def, path, o, key, privateAccess, () =>
                                        Reflect.set(o, key, cast(val, def[key]))
                                    );
                                },

                                deleteProperty(o, key) {
                                    return controlMutation(model, def, path, o, key, privateAccess, () =>
                                        Reflect.deleteProperty(o, key)
                                    );
                                },

                                defineProperty(o, key, args) {
                                    return controlMutation(model, def, path, o, key, privateAccess, () =>
                                        Reflect.defineProperty(o, key, args)
                                    );
                                },

                                has(o, key) {
                                    return (
                                        Reflect.has(o, key) && Reflect.has(def, key) && !model.conventionForPrivate(key)
                                    );
                                },

                                ownKeys(o) {
                                    return Reflect.ownKeys(o).filter(
                                        (key) => Reflect.has(def, key) && !model.conventionForPrivate(key)
                                    );
                                },

                                getOwnPropertyDescriptor(o, key) {
                                    let descriptor;
                                    if (!model.conventionForPrivate(key)) {
                                        descriptor = Object.getOwnPropertyDescriptor(def, key);
                                        if (descriptor !== undefined) descriptor.value = o[key];
                                    }

                                    return descriptor;
                                },
                            };
                        };

                    function Model(def, params) {
                        return (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.isPlainObject)(def)
                            ? new ObjectModel(def, params)
                            : new BasicModel(def);
                    }

                    Object.assign(Model.prototype, {
                        name: 'Model',
                        assertions: [],

                        conventionForConstant: (key) => key.toUpperCase() === key,
                        conventionForPrivate: (key) => key[0] === '_',

                        toString(stack) {
                            return (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.has)(this, 'name')
                                ? this.name
                                : formatDefinition(this.definition, stack) + formatAssertions(this.assertions);
                        },

                        as(name) {
                            (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.define)(this, 'name', name);
                            return this;
                        },

                        defaultTo(val) {
                            this.default = val;
                            return this;
                        },

                        [_check](obj, path, errors, stack) {
                            checkDefinition(obj, this.definition, path, errors, stack);
                            checkAssertions(obj, this, path, errors);
                        },

                        test(obj, errorCollector) {
                            let model = this;
                            while (!(0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.has)(model, 'errorCollector')) {
                                model = (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.getProto)(model);
                            }

                            const initialErrorCollector = model.errorCollector;
                            let failed;

                            model.errorCollector = (errors) => {
                                failed = true;
                                if (errorCollector) errorCollector.call(this, errors);
                            };

                            new this(obj); // may trigger errorCollector

                            model.errorCollector = initialErrorCollector;
                            return !failed;
                        },

                        errorCollector(errors) {
                            const e = new TypeError(errors.map((e) => e.message).join('\n'));
                            e.stack = e.stack.replace(/\n.*object-model(.|\n)*object-model.*/, ''); // blackbox objectmodel in stacktrace
                            throw e;
                        },

                        assert(assertion, description = format(assertion)) {
                            (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.define)(assertion, 'description', description);
                            this.assertions = this.assertions.concat(assertion);
                            return this;
                        },
                    });

                    Model.CHECK_ONCE = CHECK_ONCE;

                    function BasicModel(def) {
                        return initModel(def, BasicModel);
                    }

                    (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.extend)(BasicModel, Model, {
                        extend(...newParts) {
                            const child = extendModel(
                                new BasicModel(extendDefinition(this.definition, newParts)),
                                this
                            );
                            for (let part of newParts) {
                                if ((0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.is)(BasicModel, part))
                                    child.assertions.push(...part.assertions);
                            }

                            return child;
                        },
                    });

                    function ObjectModel(def) {
                        return initModel(
                            def,
                            ObjectModel,
                            Object,
                            initObjectModel,
                            (model) => getTraps(model, def),
                            true
                        );
                    }

                    (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.extend)(ObjectModel, Model, {
                        defaultTo(obj) {
                            const def = this.definition;
                            for (let key in obj) {
                                if ((0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.has)(def, key)) {
                                    obj[key] = checkDefinition(obj[key], def[key], key, this.errors, [], true);
                                }
                            }
                            unstackErrors(this);
                            this.default = obj;
                            return this;
                        },

                        toString(stack) {
                            return format(this.definition, stack);
                        },

                        extend(...newParts) {
                            const definition = { ...this.definition };
                            const proto = { ...this.prototype };
                            const defaults = { ...this.default };
                            const newAssertions = [];

                            for (let part of newParts) {
                                if ((0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.is)(Model, part)) {
                                    (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.merge)(definition, part.definition);
                                    (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.merge)(defaults, part.default);
                                    newAssertions.push(...part.assertions);
                                }
                                if ((0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.isFunction)(part))
                                    (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.merge)(proto, part.prototype);
                                if ((0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(part))
                                    (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.merge)(definition, part);
                            }

                            const submodel = extendModel(new ObjectModel(definition), this, proto).defaultTo(defaults);
                            submodel.assertions = [...this.assertions, ...newAssertions];

                            if (
                                (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.getProto)(this) !== ObjectModel.prototype
                            ) {
                                // extended class
                                submodel.parentClass = this;
                            }

                            return submodel;
                        },

                        [_check](obj, path, errors, stack, shouldCast) {
                            if ((0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.isObject)(obj)) {
                                checkDefinition(
                                    obj[_original] || obj,
                                    this.definition,
                                    path,
                                    errors,
                                    stack,
                                    shouldCast
                                );
                            } else stackError(errors, this, obj, path);

                            checkAssertions(obj, this, path, errors);
                        },
                    });

                    const Any = (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.proxify)(BasicModel(), {
                        apply(target, ctx, [def]) {
                            const anyOf = Object.create(Any);
                            anyOf.definition = def;
                            return anyOf;
                        },
                    });
                    Any.definition = Any;
                    Any.toString = () => 'Any';

                    Any.remaining = function (def) {
                        this.definition = def;
                    };
                    (0, _helpers_js__WEBPACK_IMPORTED_MODULE_0__.extend)(Any.remaining, Any, {
                        toString() {
                            return '...' + formatDefinition(this.definition);
                        },
                    });
                    Any[Symbol.iterator] = function* () {
                        yield new Any.remaining(this.definition);
                    };

                    /***/
                },
                /* 3 */
                /***/ (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {
                    __webpack_require__.r(__webpack_exports__);
                    /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                        /* harmony export */ ObjectProto: () => /* binding */ ObjectProto,
                        /* harmony export */ bettertypeof: () => /* binding */ bettertypeof,
                        /* harmony export */ getProto: () => /* binding */ getProto,
                        /* harmony export */ setProto: () => /* binding */ setProto,
                        /* harmony export */ has: () => /* binding */ has,
                        /* harmony export */ is: () => /* binding */ is,
                        /* harmony export */ isFunction: () => /* binding */ isFunction,
                        /* harmony export */ isObject: () => /* binding */ isObject,
                        /* harmony export */ isString: () => /* binding */ isString,
                        /* harmony export */ isPlainObject: () => /* binding */ isPlainObject,
                        /* harmony export */ isIterable: () => /* binding */ isIterable,
                        /* harmony export */ proxify: () => /* binding */ proxify,
                        /* harmony export */ merge: () => /* binding */ merge,
                        /* harmony export */ define: () => /* binding */ define,
                        /* harmony export */ extend: () => /* binding */ extend,
                        /* harmony export */
                    });
                    const ObjectProto = Object.prototype,
                        bettertypeof = (x) => ObjectProto.toString.call(x).match(/\s([a-zA-Z]+)/)[1],
                        getProto = Object.getPrototypeOf,
                        setProto = Object.setPrototypeOf,
                        has = (o, prop) => ObjectProto.hasOwnProperty.call(o, prop),
                        is = (Constructor, obj) => obj instanceof Constructor,
                        isFunction = (f) => typeof f === 'function',
                        isObject = (o) => o && typeof o === 'object',
                        isString = (s) => typeof s === 'string',
                        isPlainObject = (o) => isObject(o) && getProto(o) === ObjectProto,
                        isIterable = (x) => x && isFunction(x[Symbol.iterator]),
                        proxify = (val, traps) => new Proxy(val, traps),
                        merge = (target, src = {}) => {
                            for (let key in src) {
                                if (isPlainObject(src[key])) {
                                    const o = {};
                                    merge(o, target[key]);
                                    merge(o, src[key]);
                                    target[key] = o;
                                } else {
                                    target[key] = src[key];
                                }
                            }
                            return target;
                        },
                        define = (obj, key, value, enumerable = false) => {
                            Object.defineProperty(obj, key, { value, enumerable, writable: true, configurable: true });
                        },
                        extend = (child, parent, props) => {
                            child.prototype = Object.assign(
                                Object.create(parent.prototype, {
                                    constructor: {
                                        value: child,
                                        writable: true,
                                        configurable: true,
                                    },
                                }),
                                props
                            );
                            setProto(child, parent);
                        };

                    /***/
                },
                /* 4 */
                /***/ (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {
                    __webpack_require__.r(__webpack_exports__);
                    /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                        /* harmony export */ default: () => /* binding */ ArrayModel,
                        /* harmony export */
                    });
                    /* harmony import */ var _object_model_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
                    /* harmony import */ var _list_model_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
                    /* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);

                    function ArrayModel(initialDefinition) {
                        const model = (0, _list_model_js__WEBPACK_IMPORTED_MODULE_1__.initListModel)(
                            Array,
                            ArrayModel,
                            initialDefinition,
                            (a) =>
                                Array.isArray(a)
                                    ? a.map((arg) =>
                                          (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.cast)(arg, model.definition)
                                      )
                                    : a,
                            (a) => [...a],
                            {
                                copyWithin: [],
                                fill: [0, 0],
                                pop: [],
                                push: [0],
                                reverse: [],
                                shift: [],
                                sort: [],
                                splice: [2],
                                unshift: [0],
                            },
                            {
                                set(arr, key, val) {
                                    return controlMutation(model, arr, key, val, (a, v) => (a[key] = v), true);
                                },

                                deleteProperty(arr, key) {
                                    return controlMutation(model, arr, key, undefined, (a) => delete a[key]);
                                },
                            }
                        );

                        return model;
                    }

                    (0, _helpers_js__WEBPACK_IMPORTED_MODULE_2__.extend)(
                        ArrayModel,
                        _object_model_js__WEBPACK_IMPORTED_MODULE_0__.Model,
                        {
                            toString(stack) {
                                return (
                                    'Array of ' +
                                    (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.formatDefinition)(
                                        this.definition,
                                        stack
                                    )
                                );
                            },

                            [_object_model_js__WEBPACK_IMPORTED_MODULE_0__._check](arr, path, errors, stack) {
                                if (Array.isArray(arr))
                                    (arr[_object_model_js__WEBPACK_IMPORTED_MODULE_0__._original] || arr).forEach(
                                        (a, i) =>
                                            (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.checkDefinition)(
                                                a,
                                                this.definition,
                                                `${path || 'Array'}[${i}]`,
                                                errors,
                                                stack
                                            )
                                    );
                                else
                                    (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.stackError)(
                                        errors,
                                        this,
                                        arr,
                                        path
                                    );
                                (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.checkAssertions)(
                                    arr,
                                    this,
                                    path,
                                    errors
                                );
                            },

                            extend(...newParts) {
                                return (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.extendModel)(
                                    new ArrayModel(
                                        (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.extendDefinition)(
                                            this.definition,
                                            newParts
                                        )
                                    ),
                                    this
                                );
                            },
                        }
                    );

                    const controlMutation = (model, array, key, value, applyMutation, canBeExtended) => {
                        const path = `Array[${key}]`;
                        const isInDef = +key >= 0 && (canBeExtended || key in array);
                        if (isInDef)
                            value = (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.checkDefinition)(
                                value,
                                model.definition,
                                path,
                                model.errors,
                                [],
                                true
                            );

                        const testArray = [...array];
                        applyMutation(testArray);
                        (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.checkAssertions)(testArray, model, path);
                        const isSuccess = !(0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.unstackErrors)(model);
                        if (isSuccess) applyMutation(array, value);
                        return isSuccess;
                    };

                    /***/
                },
                /* 5 */
                /***/ (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {
                    __webpack_require__.r(__webpack_exports__);
                    /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                        /* harmony export */ initListModel: () => /* binding */ initListModel,
                        /* harmony export */
                    });
                    /* harmony import */ var _object_model_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
                    /* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);

                    const initListModel = (base, constructor, def, init, clone, mutators, otherTraps) => {
                        return (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.initModel)(
                            def,
                            constructor,
                            base,
                            init,
                            (model) =>
                                Object.assign(
                                    {
                                        getPrototypeOf: () => model.prototype,
                                        get(l, key) {
                                            if (key === _object_model_js__WEBPACK_IMPORTED_MODULE_0__._original)
                                                return l;

                                            const val = l[key];
                                            return (0, _helpers_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(val)
                                                ? (0, _helpers_js__WEBPACK_IMPORTED_MODULE_1__.proxify)(val, {
                                                      apply(fn, ctx, args) {
                                                          if (
                                                              (0, _helpers_js__WEBPACK_IMPORTED_MODULE_1__.has)(
                                                                  mutators,
                                                                  key
                                                              )
                                                          ) {
                                                              // indexes of arguments to check def + cast
                                                              const [begin, end = args.length - 1, getArgDef] =
                                                                  mutators[key];
                                                              for (let i = begin; i <= end; i++) {
                                                                  const argDef = getArgDef
                                                                      ? getArgDef(i)
                                                                      : model.definition;
                                                                  args[i] = (0,
                                                                  _object_model_js__WEBPACK_IMPORTED_MODULE_0__.checkDefinition)(
                                                                      args[i],
                                                                      argDef,
                                                                      `${base.name}.${key} arguments[${i}]`,
                                                                      model.errors,
                                                                      [],
                                                                      true
                                                                  );
                                                              }

                                                              if (model.assertions.length > 0) {
                                                                  const testingClone = clone(l);
                                                                  fn.apply(testingClone, args);
                                                                  (0,
                                                                  _object_model_js__WEBPACK_IMPORTED_MODULE_0__.checkAssertions)(
                                                                      testingClone,
                                                                      model,
                                                                      `after ${key} mutation`
                                                                  );
                                                              }

                                                              (0,
                                                              _object_model_js__WEBPACK_IMPORTED_MODULE_0__.unstackErrors)(
                                                                  model
                                                              );
                                                          }

                                                          return fn.apply(l, args);
                                                      },
                                                  })
                                                : val;
                                        },
                                    },
                                    otherTraps
                                )
                        );
                    };

                    /***/
                },
                /* 6 */
                /***/ (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {
                    __webpack_require__.r(__webpack_exports__);
                    /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                        /* harmony export */ default: () => /* binding */ SetModel,
                        /* harmony export */
                    });
                    /* harmony import */ var _object_model_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
                    /* harmony import */ var _list_model_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
                    /* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);

                    function SetModel(initialDefinition) {
                        const model = (0, _list_model_js__WEBPACK_IMPORTED_MODULE_1__.initListModel)(
                            Set,
                            SetModel,
                            initialDefinition,
                            (it) =>
                                (0, _helpers_js__WEBPACK_IMPORTED_MODULE_2__.isIterable)(it)
                                    ? new Set(
                                          [...it].map((val) =>
                                              (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.cast)(
                                                  val,
                                                  model.definition
                                              )
                                          )
                                      )
                                    : it,
                            (set) => new Set(set),
                            {
                                add: [0, 0],
                                delete: [],
                                clear: [],
                            }
                        );

                        return model;
                    }

                    (0, _helpers_js__WEBPACK_IMPORTED_MODULE_2__.extend)(
                        SetModel,
                        _object_model_js__WEBPACK_IMPORTED_MODULE_0__.Model,
                        {
                            toString(stack) {
                                return (
                                    'Set of ' +
                                    (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.formatDefinition)(
                                        this.definition,
                                        stack
                                    )
                                );
                            },

                            [_object_model_js__WEBPACK_IMPORTED_MODULE_0__._check](set, path, errors, stack) {
                                if ((0, _helpers_js__WEBPACK_IMPORTED_MODULE_2__.is)(Set, set)) {
                                    for (let item of set.values()) {
                                        (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.checkDefinition)(
                                            item,
                                            this.definition,
                                            `${path || 'Set'} value`,
                                            errors,
                                            stack
                                        );
                                    }
                                } else
                                    (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.stackError)(
                                        errors,
                                        this,
                                        set,
                                        path
                                    );
                                (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.checkAssertions)(
                                    set,
                                    this,
                                    path,
                                    errors
                                );
                            },

                            extend(...newParts) {
                                return (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.extendModel)(
                                    new SetModel(
                                        (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.extendDefinition)(
                                            this.definition,
                                            newParts
                                        )
                                    ),
                                    this
                                );
                            },
                        }
                    );

                    /***/
                },
                /* 7 */
                /***/ (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {
                    __webpack_require__.r(__webpack_exports__);
                    /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                        /* harmony export */ default: () => /* binding */ MapModel,
                        /* harmony export */
                    });
                    /* harmony import */ var _object_model_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
                    /* harmony import */ var _list_model_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(5);
                    /* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(3);

                    function MapModel(initialKeyDefinition, initialValueDefinition) {
                        const getDef = (i) => (i === 0 ? model.definition.key : model.definition.value);
                        const model = (0, _list_model_js__WEBPACK_IMPORTED_MODULE_1__.initListModel)(
                            Map,
                            MapModel,
                            { key: initialKeyDefinition, value: initialValueDefinition },
                            (it) =>
                                (0, _helpers_js__WEBPACK_IMPORTED_MODULE_2__.isIterable)(it)
                                    ? new Map(
                                          [...it].map((pair) =>
                                              pair.map((x, i) =>
                                                  (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.cast)(x, getDef(i))
                                              )
                                          )
                                      )
                                    : it,
                            (map) => new Map(map),
                            {
                                set: [0, 1, getDef],
                                delete: [],
                                clear: [],
                            }
                        );

                        return model;
                    }

                    (0, _helpers_js__WEBPACK_IMPORTED_MODULE_2__.extend)(
                        MapModel,
                        _object_model_js__WEBPACK_IMPORTED_MODULE_0__.Model,
                        {
                            toString(stack) {
                                return `Map of ${(0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.formatDefinition)(this.definition.key, stack)} : ${(0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.formatDefinition)(this.definition.value, stack)}`;
                            },

                            [_object_model_js__WEBPACK_IMPORTED_MODULE_0__._check](map, path, errors, stack) {
                                if ((0, _helpers_js__WEBPACK_IMPORTED_MODULE_2__.is)(Map, map)) {
                                    path = path || 'Map';
                                    for (let [key, value] of map) {
                                        (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.checkDefinition)(
                                            key,
                                            this.definition.key,
                                            `${path} key`,
                                            errors,
                                            stack
                                        );
                                        (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.checkDefinition)(
                                            value,
                                            this.definition.value,
                                            `${path}[${(0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.format)(key)}]`,
                                            errors,
                                            stack
                                        );
                                    }
                                } else
                                    (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.stackError)(
                                        errors,
                                        this,
                                        map,
                                        path
                                    );
                                (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.checkAssertions)(
                                    map,
                                    this,
                                    path,
                                    errors
                                );
                            },

                            extend(keyParts, valueParts) {
                                return (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.extendModel)(
                                    new MapModel(
                                        (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.extendDefinition)(
                                            this.definition.key,
                                            keyParts
                                        ),
                                        (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.extendDefinition)(
                                            this.definition.value,
                                            valueParts
                                        )
                                    ),
                                    this
                                );
                            },
                        }
                    );

                    /***/
                },
                /* 8 */
                /***/ (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {
                    __webpack_require__.r(__webpack_exports__);
                    /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                        /* harmony export */ default: () => /* binding */ FunctionModel,
                        /* harmony export */
                    });
                    /* harmony import */ var _object_model_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
                    /* harmony import */ var _helpers_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(3);

                    function FunctionModel(...argsDef) {
                        return (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.initModel)(
                            { arguments: argsDef },
                            FunctionModel,
                            Function,
                            null,
                            (model) => ({
                                getPrototypeOf: () => model.prototype,

                                get(fn, key) {
                                    return key === _object_model_js__WEBPACK_IMPORTED_MODULE_0__._original
                                        ? fn
                                        : fn[key];
                                },

                                apply(fn, ctx, args) {
                                    const def = model.definition;
                                    const remainingArgDef = def.arguments.find((argDef) =>
                                        (0, _helpers_js__WEBPACK_IMPORTED_MODULE_1__.is)(
                                            _object_model_js__WEBPACK_IMPORTED_MODULE_0__.Any.remaining,
                                            argDef
                                        )
                                    );
                                    const nbArgsToCheck = remainingArgDef
                                        ? Math.max(args.length, def.arguments.length - 1)
                                        : def.arguments.length;

                                    for (let i = 0; i < nbArgsToCheck; i++) {
                                        const argDef =
                                            remainingArgDef && i >= def.arguments.length - 1
                                                ? remainingArgDef.definition
                                                : def.arguments[i];
                                        args[i] = (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.checkDefinition)(
                                            args[i],
                                            argDef,
                                            `arguments[${i}]`,
                                            model.errors,
                                            [],
                                            true
                                        );
                                    }

                                    (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.checkAssertions)(
                                        args,
                                        model,
                                        'arguments'
                                    );

                                    let result;
                                    if (!model.errors.length) {
                                        result = Reflect.apply(fn, ctx, args);
                                        if ('return' in def)
                                            result = (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.checkDefinition)(
                                                result,
                                                def.return,
                                                'return value',
                                                model.errors,
                                                [],
                                                true
                                            );
                                    }
                                    (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.unstackErrors)(model);
                                    return result;
                                },
                            })
                        );
                    }

                    (0, _helpers_js__WEBPACK_IMPORTED_MODULE_1__.extend)(
                        FunctionModel,
                        _object_model_js__WEBPACK_IMPORTED_MODULE_0__.Model,
                        {
                            toString(stack = []) {
                                let out = `Function(${this.definition.arguments
                                    .map((argDef) =>
                                        (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.formatDefinition)(argDef, [
                                            ...stack,
                                        ])
                                    )
                                    .join(', ')})`;

                                if ('return' in this.definition) {
                                    out +=
                                        ' => ' +
                                        (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.formatDefinition)(
                                            this.definition.return,
                                            stack
                                        );
                                }
                                return out;
                            },

                            return(def) {
                                this.definition.return = def;
                                return this;
                            },

                            extend(newArgs, newReturns) {
                                const args = this.definition.arguments,
                                    mixedArgs = newArgs.map((a, i) =>
                                        (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.extendDefinition)(
                                            i in args ? args[i] : [],
                                            newArgs[i]
                                        )
                                    ),
                                    mixedReturns = (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.extendDefinition)(
                                        this.definition.return,
                                        newReturns
                                    );
                                return (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.extendModel)(
                                    new FunctionModel(...mixedArgs).return(mixedReturns),
                                    this
                                );
                            },

                            [_object_model_js__WEBPACK_IMPORTED_MODULE_0__._check](f, path, errors) {
                                if (!(0, _helpers_js__WEBPACK_IMPORTED_MODULE_1__.isFunction)(f))
                                    (0, _object_model_js__WEBPACK_IMPORTED_MODULE_0__.stackError)(
                                        errors,
                                        'Function',
                                        f,
                                        path
                                    );
                            },
                        }
                    );

                    /***/
                },
                /* 9 */
                /***/ (__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {
                    __webpack_require__.r(__webpack_exports__);
                    /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                        /* harmony export */ Model: () =>
                            /* reexport safe */ _object_model_js__WEBPACK_IMPORTED_MODULE_0__.Model,
                        /* harmony export */ BasicModel: () =>
                            /* reexport safe */ _object_model_js__WEBPACK_IMPORTED_MODULE_0__.BasicModel,
                        /* harmony export */ ObjectModel: () =>
                            /* reexport safe */ _object_model_js__WEBPACK_IMPORTED_MODULE_0__.ObjectModel,
                        /* harmony export */ Any: () =>
                            /* reexport safe */ _object_model_js__WEBPACK_IMPORTED_MODULE_0__.Any,
                        /* harmony export */ ArrayModel: () =>
                            /* reexport safe */ _array_model_js__WEBPACK_IMPORTED_MODULE_1__['default'],
                        /* harmony export */ FunctionModel: () =>
                            /* reexport safe */ _function_model_js__WEBPACK_IMPORTED_MODULE_2__['default'],
                        /* harmony export */ MapModel: () =>
                            /* reexport safe */ _map_model_js__WEBPACK_IMPORTED_MODULE_3__['default'],
                        /* harmony export */ SetModel: () =>
                            /* reexport safe */ _set_model_js__WEBPACK_IMPORTED_MODULE_4__['default'],
                        /* harmony export */
                    });
                    /* harmony import */ var _object_model_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
                    /* harmony import */ var _array_model_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
                    /* harmony import */ var _function_model_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8);
                    /* harmony import */ var _map_model_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(7);
                    /* harmony import */ var _set_model_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(6);

                    /***/
                },
                /* 10 */
                /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                    __webpack_require__.r(__webpack_exports__);
                    /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                        /* harmony export */ Primitive: () => /* binding */ Primitive,
                        /* harmony export */ Falsy: () => /* binding */ Falsy,
                        /* harmony export */ Truthy: () => /* binding */ Truthy,
                        /* harmony export */ Integer: () => /* binding */ Integer,
                        /* harmony export */ SafeInteger: () => /* binding */ SafeInteger,
                        /* harmony export */ FiniteNumber: () => /* binding */ FiniteNumber,
                        /* harmony export */ PositiveNumber: () => /* binding */ PositiveNumber,
                        /* harmony export */ NegativeNumber: () => /* binding */ NegativeNumber,
                        /* harmony export */ PositiveInteger: () => /* binding */ PositiveInteger,
                        /* harmony export */ NegativeInteger: () => /* binding */ NegativeInteger,
                        /* harmony export */ FullString: () => /* binding */ FullString,
                        /* harmony export */ NormalizedString: () => /* binding */ NormalizedString,
                        /* harmony export */ TrimmedString: () => /* binding */ TrimmedString,
                        /* harmony export */ PastDate: () => /* binding */ PastDate,
                        /* harmony export */ FutureDate: () => /* binding */ FutureDate,
                        /* harmony export */ FullArray: () => /* binding */ FullArray,
                        /* harmony export */ UniqueArray: () => /* binding */ UniqueArray,
                        /* harmony export */ DenseArray: () => /* binding */ DenseArray,
                        /* harmony export */ PromiseOf: () => /* binding */ PromiseOf,
                        /* harmony export */
                    });
                    /* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(11);
                    /* harmony import */ var _blue_core__WEBPACK_IMPORTED_MODULE_0___default =
                        /*#__PURE__*/ __webpack_require__.n(_blue_core__WEBPACK_IMPORTED_MODULE_0__);
                    /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(12);
                    /* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_1___default =
                        /*#__PURE__*/ __webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_1__);
                    /* harmony import */ var _node_modules_objectmodel_src_object_model__WEBPACK_IMPORTED_MODULE_2__ =
                        __webpack_require__(2);
                    /**
                     * @author Jeff Rose
                     * @module model
                     */

                    const { isFinite, isInteger, isSafeInteger } = Number,
                        isDense = (arr) =>
                            (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.equals)(
                                (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.length)(
                                    (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.filter)(
                                        _blue_util__WEBPACK_IMPORTED_MODULE_1__.T,
                                        arr
                                    )
                                ),
                                (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.length)(arr)
                            ),
                        greaterThanZero = (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.gt)(
                            _blue_util__WEBPACK_IMPORTED_MODULE_1__.__,
                            0
                        ),
                        lessThanZero = (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.lt)(
                            _blue_util__WEBPACK_IMPORTED_MODULE_1__.__,
                            0
                        ),
                        isFalsy = (x) => !x,
                        isTruthy = (x) => !!x,
                        isNotBlank = (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.complement)(
                            (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.both)(
                                _blue_util__WEBPACK_IMPORTED_MODULE_1__.isString,
                                _blue_util__WEBPACK_IMPORTED_MODULE_1__.isEmpty
                            )
                        ),
                        isNegativeNumber = (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.both)(
                            _blue_util__WEBPACK_IMPORTED_MODULE_1__.isNumber,
                            lessThanZero
                        ),
                        isPositiveNumber = (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.both)(
                            _blue_util__WEBPACK_IMPORTED_MODULE_1__.isNumber,
                            greaterThanZero
                        ),
                        isNotEmpty = (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.complement)(
                            _blue_util__WEBPACK_IMPORTED_MODULE_1__.isEmpty
                        ),
                        isNormalized = (str) => str.normalize() === str,
                        isTrimmed = (str) => (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.trim)(str) === str,
                        isUnique = (arr) =>
                            (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.equals)(
                                (0, _blue_util__WEBPACK_IMPORTED_MODULE_1__.uniq)(arr),
                                arr
                            );
                    // eslint-disable-next-line no-undef
                    const Primitive = (0,
                    _node_modules_objectmodel_src_object_model__WEBPACK_IMPORTED_MODULE_2__.BasicModel)([
                        BigInt,
                        Boolean,
                        Number,
                        String,
                        Symbol,
                        null,
                        undefined,
                    ])
                        .assert(_blue_core__WEBPACK_IMPORTED_MODULE_0__.isPrimitive)
                        .as('Primitive');
                    // Booleans-like
                    const Falsy = (0,
                    _node_modules_objectmodel_src_object_model__WEBPACK_IMPORTED_MODULE_2__.BasicModel)(Primitive)
                        .assert(isFalsy)
                        .as('Falsy');
                    const Truthy = (0,
                    _node_modules_objectmodel_src_object_model__WEBPACK_IMPORTED_MODULE_2__.BasicModel)([
                        Primitive,
                        Object,
                    ])
                        .assert(isTruthy)
                        .as('Truthy');
                    // Numbers
                    const Integer = (0,
                    _node_modules_objectmodel_src_object_model__WEBPACK_IMPORTED_MODULE_2__.BasicModel)(Number)
                        .assert(isInteger)
                        .as('Integer');
                    const SafeInteger = (0,
                    _node_modules_objectmodel_src_object_model__WEBPACK_IMPORTED_MODULE_2__.BasicModel)(Number)
                        .assert(isSafeInteger)
                        .as('SafeInteger');
                    const FiniteNumber = (0,
                    _node_modules_objectmodel_src_object_model__WEBPACK_IMPORTED_MODULE_2__.BasicModel)(Number)
                        .assert(isFinite)
                        .as('FiniteNumber');
                    const PositiveNumber = (0,
                    _node_modules_objectmodel_src_object_model__WEBPACK_IMPORTED_MODULE_2__.BasicModel)(Number)
                        .assert(isPositiveNumber)
                        .as('PositiveNumber');
                    const NegativeNumber = (0,
                    _node_modules_objectmodel_src_object_model__WEBPACK_IMPORTED_MODULE_2__.BasicModel)(Number)
                        .assert(isNegativeNumber)
                        .as('NegativeNumber');
                    const PositiveInteger = PositiveNumber.extend().assert(isInteger).as('PositiveInteger');
                    const NegativeInteger = NegativeNumber.extend().assert(isInteger).as('NegativeInteger');
                    // Strings
                    const FullString = (0,
                    _node_modules_objectmodel_src_object_model__WEBPACK_IMPORTED_MODULE_2__.BasicModel)(String)
                        .assert(isNotBlank)
                        .as('FullString');
                    const NormalizedString = (0,
                    _node_modules_objectmodel_src_object_model__WEBPACK_IMPORTED_MODULE_2__.BasicModel)(String)
                        .assert(isNormalized)
                        .as('NormalizedString');
                    const TrimmedString = (0,
                    _node_modules_objectmodel_src_object_model__WEBPACK_IMPORTED_MODULE_2__.BasicModel)(String)
                        .assert(isTrimmed)
                        .as('TrimmedString');
                    // Dates
                    const PastDate = (0,
                    _node_modules_objectmodel_src_object_model__WEBPACK_IMPORTED_MODULE_2__.BasicModel)(Date)
                        .assert(_blue_util__WEBPACK_IMPORTED_MODULE_1__.isPast)
                        .as('PastDate');
                    const FutureDate = (0,
                    _node_modules_objectmodel_src_object_model__WEBPACK_IMPORTED_MODULE_2__.BasicModel)(Date)
                        .assert(_blue_util__WEBPACK_IMPORTED_MODULE_1__.isFuture)
                        .as('FutureDate');
                    // Arrays
                    const FullArray = (0,
                    _node_modules_objectmodel_src_object_model__WEBPACK_IMPORTED_MODULE_2__.BasicModel)(Array)
                        .assert(isNotEmpty)
                        .as('FullArray');
                    const UniqueArray = (0,
                    _node_modules_objectmodel_src_object_model__WEBPACK_IMPORTED_MODULE_2__.BasicModel)(Array)
                        .assert(isUnique)
                        .as('UniqueArray');
                    const DenseArray = (0,
                    _node_modules_objectmodel_src_object_model__WEBPACK_IMPORTED_MODULE_2__.BasicModel)(Array)
                        .assert(isDense)
                        .as('DenseArray');
                    // Others
                    const PromiseOf = (model) => (p) =>
                        (0, _node_modules_objectmodel_src_object_model__WEBPACK_IMPORTED_MODULE_2__.BasicModel)(
                            Promise
                        )(p).then((x) => model(x));
                    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzaWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYmFzaWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUNILE9BQU8sRUFBRSxXQUFXLEdBQUcsTUFBTSxZQUFZLENBQUM7QUFDMUMsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQUNoSixPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sOENBQThDLENBQUM7QUFFMUUsTUFDSSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLEdBQUcsTUFBTSxFQUMvQyxPQUFPLEdBQUcsQ0FBRSxHQUFlLEVBQUcsRUFBRSxDQUFDLE1BQU0sQ0FBRSxNQUFNLENBQUUsTUFBTSxDQUFFLENBQUMsRUFBRSxHQUFHLENBQUUsQ0FBRSxFQUFFLE1BQU0sQ0FBRSxHQUFHLENBQUUsQ0FBRSxFQUNwRixlQUFlLEdBQUcsRUFBRSxDQUFFLEVBQUUsRUFBRSxDQUFDLENBQUUsRUFDN0IsWUFBWSxHQUFHLEVBQUUsQ0FBRSxFQUFFLEVBQUUsQ0FBQyxDQUFFLEVBQzFCLE9BQU8sR0FBRyxDQUFFLENBQUMsRUFBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQ3JCLFFBQVEsR0FBRyxDQUFFLENBQUMsRUFBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFDdkIsVUFBVSxHQUFHLFVBQVUsQ0FBRSxJQUFJLENBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBRSxDQUFFLEVBQ3BELGdCQUFnQixHQUFHLElBQUksQ0FBRSxRQUFRLEVBQUUsWUFBWSxDQUFrQyxFQUNqRixnQkFBZ0IsR0FBRyxJQUFJLENBQUUsUUFBUSxFQUFFLGVBQWUsQ0FBa0MsRUFDcEYsVUFBVSxHQUFHLFVBQVUsQ0FBRSxPQUFPLENBQUUsRUFDbEMsWUFBWSxHQUFHLENBQUUsR0FBVyxFQUFHLEVBQUUsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLEtBQUssR0FBRyxFQUN6RCxTQUFTLEdBQUcsQ0FBRSxHQUFXLEVBQUcsRUFBRSxDQUFDLElBQUksQ0FBRSxHQUFHLENBQUUsS0FBSyxHQUFHLEVBQ2xELFFBQVEsR0FBRyxDQUFFLEdBQWUsRUFBRyxFQUFFLENBQUMsTUFBTSxDQUFFLElBQUksQ0FBRSxHQUFHLENBQUUsRUFBRSxHQUFHLENBQUUsQ0FBQztBQUVqRSxvQ0FBb0M7QUFDcEMsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBRSxDQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLFNBQVMsQ0FBRSxDQUFFLENBQUMsTUFBTSxDQUFFLFdBQVcsQ0FBRSxDQUFDLEVBQUUsQ0FBRSxXQUFXLENBQUUsQ0FBQztBQUU1SSxnQkFBZ0I7QUFDaEIsTUFBTSxDQUFDLE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FBRSxTQUFTLENBQUUsQ0FBQyxNQUFNLENBQUUsT0FBTyxDQUFFLENBQUMsRUFBRSxDQUFFLE9BQU8sQ0FBRSxDQUFDO0FBQzdFLE1BQU0sQ0FBQyxNQUFNLE1BQU0sR0FBRyxVQUFVLENBQUUsQ0FBRSxTQUFTLEVBQUUsTUFBTSxDQUFFLENBQUUsQ0FBQyxNQUFNLENBQUUsUUFBUSxDQUFFLENBQUMsRUFBRSxDQUFFLFFBQVEsQ0FBRSxDQUFDO0FBRTVGLFVBQVU7QUFDVixNQUFNLENBQUMsTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFFLE1BQU0sQ0FBRSxDQUFDLE1BQU0sQ0FBRSxTQUFTLENBQUUsQ0FBQyxFQUFFLENBQUUsU0FBUyxDQUFFLENBQUM7QUFDaEYsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBRSxNQUFNLENBQUUsQ0FBQyxNQUFNLENBQUUsYUFBYSxDQUFFLENBQUMsRUFBRSxDQUFFLGFBQWEsQ0FBRSxDQUFDO0FBQzVGLE1BQU0sQ0FBQyxNQUFNLFlBQVksR0FBRyxVQUFVLENBQUUsTUFBTSxDQUFFLENBQUMsTUFBTSxDQUFFLFFBQVEsQ0FBRSxDQUFDLEVBQUUsQ0FBRSxjQUFjLENBQUUsQ0FBQztBQUN6RixNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUcsVUFBVSxDQUFFLE1BQU0sQ0FBRSxDQUFDLE1BQU0sQ0FBRSxnQkFBZ0IsQ0FBRSxDQUFDLEVBQUUsQ0FBRSxnQkFBZ0IsQ0FBRSxDQUFDO0FBQ3JHLE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxVQUFVLENBQUUsTUFBTSxDQUFFLENBQUMsTUFBTSxDQUFFLGdCQUFnQixDQUFFLENBQUMsRUFBRSxDQUFFLGdCQUFnQixDQUFFLENBQUM7QUFDckcsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUUsU0FBUyxDQUFFLENBQUMsRUFBRSxDQUFFLGlCQUFpQixDQUFFLENBQUM7QUFDbkcsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHLGNBQWMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUUsU0FBUyxDQUFFLENBQUMsRUFBRSxDQUFFLGlCQUFpQixDQUFFLENBQUM7QUFFbkcsVUFBVTtBQUNWLE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUUsTUFBTSxDQUFFLENBQUMsTUFBTSxDQUFFLFVBQVUsQ0FBRSxDQUFDLEVBQUUsQ0FBRSxZQUFZLENBQUUsQ0FBQztBQUN2RixNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxVQUFVLENBQUUsTUFBTSxDQUFFLENBQUMsTUFBTSxDQUFFLFlBQVksQ0FBRSxDQUFDLEVBQUUsQ0FBRSxrQkFBa0IsQ0FBRSxDQUFDO0FBQ3JHLE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyxVQUFVLENBQUUsTUFBTSxDQUFFLENBQUMsTUFBTSxDQUFFLFNBQVMsQ0FBRSxDQUFDLEVBQUUsQ0FBRSxlQUFlLENBQUUsQ0FBQztBQUU1RixRQUFRO0FBQ1IsTUFBTSxDQUFDLE1BQU0sUUFBUSxHQUFHLFVBQVUsQ0FBRSxJQUFJLENBQUUsQ0FBQyxNQUFNLENBQUUsTUFBTSxDQUFFLENBQUMsRUFBRSxDQUFFLFVBQVUsQ0FBRSxDQUFDO0FBQzdFLE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRyxVQUFVLENBQUUsSUFBSSxDQUFFLENBQUMsTUFBTSxDQUFFLFFBQVEsQ0FBRSxDQUFDLEVBQUUsQ0FBRSxZQUFZLENBQUUsQ0FBQztBQUVuRixTQUFTO0FBQ1QsTUFBTSxDQUFDLE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBRSxLQUFLLENBQUUsQ0FBQyxNQUFNLENBQUUsVUFBVSxDQUFFLENBQUMsRUFBRSxDQUFFLFdBQVcsQ0FBRSxDQUFDO0FBQ3BGLE1BQU0sQ0FBQyxNQUFNLFdBQVcsR0FBRyxVQUFVLENBQUUsS0FBSyxDQUFFLENBQUMsTUFBTSxDQUFFLFFBQVEsQ0FBRSxDQUFDLEVBQUUsQ0FBRSxhQUFhLENBQUUsQ0FBQztBQUN0RixNQUFNLENBQUMsTUFBTSxVQUFVLEdBQUcsVUFBVSxDQUFFLEtBQUssQ0FBRSxDQUFDLE1BQU0sQ0FBRSxPQUFPLENBQUUsQ0FBQyxFQUFFLENBQUUsWUFBWSxDQUFFLENBQUM7QUFFbkYsU0FBUztBQUNULE1BQU0sQ0FBQyxNQUFNLFNBQVMsR0FBRyxDQUFFLEtBQUssRUFBRyxFQUFFLENBQUMsQ0FBRSxDQUFDLEVBQUcsRUFBRSxDQUFDLFVBQVUsQ0FBRSxPQUFPLENBQUUsQ0FBRSxDQUFDLENBQUUsQ0FBQyxJQUFJLENBQUUsQ0FBRSxDQUFDLEVBQUcsRUFBRSxDQUFDLEtBQUssQ0FBRSxDQUFDLENBQUUsQ0FBRSxDQUFDIn0=

                    /***/
                },
                /* 11 */
                /***/ (module) => {
                    module.exports = __WEBPACK_EXTERNAL_MODULE__11__;

                    /***/
                },
                /* 12 */
                /***/ (module) => {
                    module.exports = __WEBPACK_EXTERNAL_MODULE__12__;

                    /***/
                },
                /* 13 */
                /***/ (__unused_webpack_module, __webpack_exports__, __webpack_require__) => {
                    __webpack_require__.r(__webpack_exports__);
                    /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                        /* harmony export */ EventModel: () => /* binding */ EventModel,
                        /* harmony export */ default: () => __WEBPACK_DEFAULT_EXPORT__,
                        /* harmony export */
                    });
                    /* harmony import */ var _blue_context__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(14);
                    /* harmony import */ var _blue_context__WEBPACK_IMPORTED_MODULE_0___default =
                        /*#__PURE__*/ __webpack_require__.n(_blue_context__WEBPACK_IMPORTED_MODULE_0__);
                    /* harmony import */ var _node_modules_objectmodel_src_object_model__WEBPACK_IMPORTED_MODULE_1__ =
                        __webpack_require__(2);
                    /* harmony import */ var _node_modules_objectmodel_src_helpers__WEBPACK_IMPORTED_MODULE_2__ =
                        __webpack_require__(3);

                    const initEventModel = function (obj, model, _this) {
                        if (obj instanceof model) {
                            return obj;
                        }
                        (0, _node_modules_objectmodel_src_helpers__WEBPACK_IMPORTED_MODULE_2__.merge)(
                            _this,
                            model.default
                        );
                        if (model.parentClass) {
                            (0, _node_modules_objectmodel_src_helpers__WEBPACK_IMPORTED_MODULE_2__.merge)(
                                obj,
                                new model.parentClass(obj)
                            );
                        }
                        (0, _node_modules_objectmodel_src_helpers__WEBPACK_IMPORTED_MODULE_2__.merge)(_this, obj);
                        _blue_context__WEBPACK_IMPORTED_MODULE_0__.asEventEmitter.call(_this);
                        return _this;
                    };
                    /**
                     * @class module:model.EventModel
                     * @extends module:model.Model
                     */
                    function EventModel(def) {
                        return (0, _node_modules_objectmodel_src_object_model__WEBPACK_IMPORTED_MODULE_1__.initModel)(
                            def,
                            EventModel,
                            Object,
                            initEventModel,
                            function (model) {
                                const traps = (0,
                                    _node_modules_objectmodel_src_object_model__WEBPACK_IMPORTED_MODULE_1__.getTraps)(
                                        model,
                                        def
                                    ),
                                    set = traps.set;
                                traps.set = function (o, key, val) {
                                    const prev = o[key],
                                        result = set(o, key, val);
                                    if (result === true && key !== '@@emitter/events') {
                                        o.emit(`change:${key}`, prev, val);
                                    }
                                    return result;
                                };
                                return traps;
                            },
                            true
                        );
                    }
                    (0, _node_modules_objectmodel_src_helpers__WEBPACK_IMPORTED_MODULE_2__.extend)(
                        EventModel,
                        _node_modules_objectmodel_src_object_model__WEBPACK_IMPORTED_MODULE_1__.Model,
                        {
                            name: 'EventModel',
                        }
                    );
                    /* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = EventModel;
                    //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXZlbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZXZlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMvQyxPQUFPLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSw4Q0FBOEMsQ0FBQztBQUMxRixPQUFPLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxNQUFNLHlDQUF5QyxDQUFDO0FBRXhFLE1BQU0sY0FBYyxHQUFHLFVBQVUsR0FBRyxFQUFFLEtBQUssRUFBRSxLQUFLO0lBQzlDLElBQUksR0FBRyxZQUFZLEtBQUssRUFBRTtRQUN0QixPQUFPLEdBQUcsQ0FBQztLQUNkO0lBQ0QsS0FBSyxDQUFFLEtBQUssRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFFLENBQUM7SUFDOUIsSUFBSSxLQUFLLENBQUMsV0FBVyxFQUFFO1FBQ25CLEtBQUssQ0FBRSxHQUFHLEVBQUUsSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFFLEdBQUcsQ0FBRSxDQUFFLENBQUM7S0FDOUM7SUFDRCxLQUFLLENBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBRSxDQUFDO0lBQ3BCLGNBQWMsQ0FBQyxJQUFJLENBQUUsS0FBSyxDQUFFLENBQUM7SUFDN0IsT0FBTyxLQUFLLENBQUM7QUFDakIsQ0FBQyxDQUFDO0FBRUY7OztHQUdHO0FBRUgsTUFBTSxVQUFVLFVBQVUsQ0FBRSxHQUFHO0lBQzNCLE9BQU8sU0FBUyxDQUFFLEdBQUcsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxVQUFVLEtBQUs7UUFDdEUsTUFDSSxLQUFLLEdBQUcsUUFBUSxDQUFFLEtBQUssRUFBRSxHQUFHLENBQUUsRUFDOUIsR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7UUFDcEIsS0FBSyxDQUFDLEdBQUcsR0FBRyxVQUFVLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRztZQUM3QixNQUNJLElBQUksR0FBRyxDQUFDLENBQUUsR0FBRyxDQUFFLEVBQ2YsTUFBTSxHQUFHLEdBQUcsQ0FBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBRSxDQUFDO1lBQ2hDLElBQUksTUFBTSxLQUFLLElBQUksSUFBSSxHQUFHLEtBQUssa0JBQWtCLEVBQUU7Z0JBQy9DLENBQUMsQ0FBQyxJQUFJLENBQUUsVUFBVyxHQUFJLEVBQUUsRUFBRSxJQUFJLEVBQUUsR0FBRyxDQUFFLENBQUM7YUFDMUM7WUFDRCxPQUFPLE1BQU0sQ0FBQztRQUNsQixDQUFDLENBQUM7UUFDRixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDLEVBQUUsSUFBSSxDQUFFLENBQUM7QUFDZCxDQUFDO0FBRUQsTUFBTSxDQUFFLFVBQVUsRUFBRSxLQUFLLEVBQUU7SUFDdkIsSUFBSSxFQUFFLFlBQVk7Q0FDckIsQ0FBRSxDQUFDO0FBRUosZUFBZSxVQUFVLENBQUMifQ==

                    /***/
                },
                /* 14 */
                /***/ (module) => {
                    module.exports = __WEBPACK_EXTERNAL_MODULE__14__;

                    /***/
                },
                /******/
            ];
            /************************************************************************/
            /******/ // The module cache
            /******/ var __webpack_module_cache__ = {};
            /******/
            /******/ // The require function
            /******/ function __webpack_require__(moduleId) {
                /******/ // Check if module is in cache
                /******/ var cachedModule = __webpack_module_cache__[moduleId];
                /******/ if (cachedModule !== undefined) {
                    /******/ return cachedModule.exports;
                    /******/
                }
                /******/ // Create a new module (and put it into the cache)
                /******/ var module = (__webpack_module_cache__[moduleId] = {
                    /******/ // no module.id needed
                    /******/ // no module.loaded needed
                    /******/ exports: {},
                    /******/
                });
                /******/
                /******/ // Execute the module function
                /******/ __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
                /******/
                /******/ // Return the exports of the module
                /******/ return module.exports;
                /******/
            }
            /******/
            /************************************************************************/
            /******/ /* webpack/runtime/compat get default export */
            /******/ (() => {
                /******/ // getDefaultExport function for compatibility with non-harmony modules
                /******/ __webpack_require__.n = (module) => {
                    /******/ var getter =
                        module && module.__esModule ? /******/ () => module['default'] : /******/ () => module;
                    /******/ __webpack_require__.d(getter, { a: getter });
                    /******/ return getter;
                    /******/
                };
                /******/
            })();
            /******/
            /******/ /* webpack/runtime/define property getters */
            /******/ (() => {
                /******/ // define getter functions for harmony exports
                /******/ __webpack_require__.d = (exports, definition) => {
                    /******/ for (var key in definition) {
                        /******/ if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
                            /******/ Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
                            /******/
                        }
                        /******/
                    }
                    /******/
                };
                /******/
            })();
            /******/
            /******/ /* webpack/runtime/hasOwnProperty shorthand */
            /******/ (() => {
                /******/ __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
                /******/
            })();
            /******/
            /******/ /* webpack/runtime/make namespace object */
            /******/ (() => {
                /******/ // define __esModule on exports
                /******/ __webpack_require__.r = (exports) => {
                    /******/ if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
                        /******/ Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
                        /******/
                    }
                    /******/ Object.defineProperty(exports, '__esModule', { value: true });
                    /******/
                };
                /******/
            })();
            /******/
            /************************************************************************/
            var __webpack_exports__ = {};
            // This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
            (() => {
                __webpack_require__.r(__webpack_exports__);
                /* harmony export */ __webpack_require__.d(__webpack_exports__, {
                    /* harmony export */ Any: () =>
                        /* reexport safe */ _node_modules_objectmodel_src_index__WEBPACK_IMPORTED_MODULE_1__.Any,
                    /* harmony export */ ArrayModel: () =>
                        /* reexport safe */ _node_modules_objectmodel_src_index__WEBPACK_IMPORTED_MODULE_1__.ArrayModel,
                    /* harmony export */ BasicModel: () =>
                        /* reexport safe */ _node_modules_objectmodel_src_index__WEBPACK_IMPORTED_MODULE_1__.BasicModel,
                    /* harmony export */ FunctionModel: () =>
                        /* reexport safe */ _node_modules_objectmodel_src_index__WEBPACK_IMPORTED_MODULE_1__.FunctionModel,
                    /* harmony export */ MapModel: () =>
                        /* reexport safe */ _node_modules_objectmodel_src_index__WEBPACK_IMPORTED_MODULE_1__.MapModel,
                    /* harmony export */ Model: () =>
                        /* reexport safe */ _node_modules_objectmodel_src_index__WEBPACK_IMPORTED_MODULE_1__.Model,
                    /* harmony export */ ObjectModel: () =>
                        /* reexport safe */ _node_modules_objectmodel_src_index__WEBPACK_IMPORTED_MODULE_1__.ObjectModel,
                    /* harmony export */ SetModel: () =>
                        /* reexport safe */ _node_modules_objectmodel_src_index__WEBPACK_IMPORTED_MODULE_1__.SetModel,
                    /* harmony export */ DenseArray: () =>
                        /* reexport safe */ _basic__WEBPACK_IMPORTED_MODULE_2__.DenseArray,
                    /* harmony export */ Falsy: () => /* reexport safe */ _basic__WEBPACK_IMPORTED_MODULE_2__.Falsy,
                    /* harmony export */ FiniteNumber: () =>
                        /* reexport safe */ _basic__WEBPACK_IMPORTED_MODULE_2__.FiniteNumber,
                    /* harmony export */ FullArray: () =>
                        /* reexport safe */ _basic__WEBPACK_IMPORTED_MODULE_2__.FullArray,
                    /* harmony export */ FullString: () =>
                        /* reexport safe */ _basic__WEBPACK_IMPORTED_MODULE_2__.FullString,
                    /* harmony export */ FutureDate: () =>
                        /* reexport safe */ _basic__WEBPACK_IMPORTED_MODULE_2__.FutureDate,
                    /* harmony export */ Integer: () => /* reexport safe */ _basic__WEBPACK_IMPORTED_MODULE_2__.Integer,
                    /* harmony export */ NegativeInteger: () =>
                        /* reexport safe */ _basic__WEBPACK_IMPORTED_MODULE_2__.NegativeInteger,
                    /* harmony export */ NegativeNumber: () =>
                        /* reexport safe */ _basic__WEBPACK_IMPORTED_MODULE_2__.NegativeNumber,
                    /* harmony export */ NormalizedString: () =>
                        /* reexport safe */ _basic__WEBPACK_IMPORTED_MODULE_2__.NormalizedString,
                    /* harmony export */ PastDate: () =>
                        /* reexport safe */ _basic__WEBPACK_IMPORTED_MODULE_2__.PastDate,
                    /* harmony export */ PositiveInteger: () =>
                        /* reexport safe */ _basic__WEBPACK_IMPORTED_MODULE_2__.PositiveInteger,
                    /* harmony export */ PositiveNumber: () =>
                        /* reexport safe */ _basic__WEBPACK_IMPORTED_MODULE_2__.PositiveNumber,
                    /* harmony export */ Primitive: () =>
                        /* reexport safe */ _basic__WEBPACK_IMPORTED_MODULE_2__.Primitive,
                    /* harmony export */ PromiseOf: () =>
                        /* reexport safe */ _basic__WEBPACK_IMPORTED_MODULE_2__.PromiseOf,
                    /* harmony export */ SafeInteger: () =>
                        /* reexport safe */ _basic__WEBPACK_IMPORTED_MODULE_2__.SafeInteger,
                    /* harmony export */ TrimmedString: () =>
                        /* reexport safe */ _basic__WEBPACK_IMPORTED_MODULE_2__.TrimmedString,
                    /* harmony export */ Truthy: () => /* reexport safe */ _basic__WEBPACK_IMPORTED_MODULE_2__.Truthy,
                    /* harmony export */ UniqueArray: () =>
                        /* reexport safe */ _basic__WEBPACK_IMPORTED_MODULE_2__.UniqueArray,
                    /* harmony export */ EventModel: () =>
                        /* reexport safe */ _event__WEBPACK_IMPORTED_MODULE_3__.EventModel,
                    /* harmony export */
                });
                /* harmony import */ var _node_modules_objectmodel_src_devtool_formatter__WEBPACK_IMPORTED_MODULE_0__ =
                    __webpack_require__(1);
                /* harmony import */ var _node_modules_objectmodel_src_index__WEBPACK_IMPORTED_MODULE_1__ =
                    __webpack_require__(9);
                /* harmony import */ var _basic__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(10);
                /* harmony import */ var _event__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(13);
                /**
                 * @author Jeff Rose
                 * @module model
                 * @requires core
                 * @requires util
                 * @see {@link http://objectmodel.js.org/}
                 */

                /**
                 * @external objectmodel
                 * @see {@link http://objectmodel.js.org/}
                 */
                /**
                 * @class module:model.Model
                 * @param {*} def
                 * @param {*} params
                 */
                /**
                 * @member {external:Array<external:Function>} module:model.Model#assertions
                 */
                /**
                 * @member {*} module:model.Model#definition
                 */
                /**
                 * @member {external:string} module:model.Model#name
                 */
                /**
                 * @function module:model.Model#as
                 * @param {external:string} newName
                 */
                /**
                 * @function module:model.Model#assert
                 * @param {external:Function} assertion
                 * @param {*} [description]
                 */
                /**
                 * @function module:model.Model#extend
                 * @param {...*} modelsOrDefinitions
                 */
                /**
                 * @class module:model.ArrayModel
                 * @extends module:model.Model
                 */
                /**
                 * @class module:model.BasicModel
                 * @extends module:model.Model
                 */
                /**
                 * @class module:model.FunctionModel
                 * @extends module:model.Model
                 */
                /**
                 * @class module:model.MapModel
                 * @extends module:model.Model
                 */
                /**
                 * @class module:model.ObjectModel
                 * @extends module:model.Model
                 */
                /**
                 * @class module:model.SetModel
                 * @extends module:model.Model
                 */
                /**
                 * @const module:model.Any
                 */

                //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7R0FPRztBQUVILE9BQU8sbURBQW1ELENBQUM7QUFFM0Q7OztHQUdHO0FBRUg7Ozs7R0FJRztBQUVIOztHQUVHO0FBRUg7O0dBRUc7QUFFSDs7R0FFRztBQUVIOzs7R0FHRztBQUVIOzs7O0dBSUc7QUFFSDs7O0dBR0c7QUFFSDs7O0dBR0c7QUFFSDs7O0dBR0c7QUFFSDs7O0dBR0c7QUFFSDs7O0dBR0c7QUFFSDs7O0dBR0c7QUFFSDs7O0dBR0c7QUFFSDs7R0FFRztBQUVILGNBQWMsdUNBQXVDLENBQUM7QUFDdEQsY0FBYyxTQUFTLENBQUM7QUFDeEIsY0FBYyxTQUFTLENBQUMifQ==
            })();

            /******/ return __webpack_exports__;
            /******/
        })();
    }
);
