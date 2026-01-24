(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("@blue/factory"), require("@blue/core"), require("@blue/context"), require("@blue/router"), require("@blue/util"));
	else if(typeof define === 'function' && define.amd)
		define(["@blue/factory", "@blue/core", "@blue/context", "@blue/router", "@blue/util"], factory);
	else if(typeof exports === 'object')
		exports["blue-view"] = factory(require("@blue/factory"), require("@blue/core"), require("@blue/context"), require("@blue/router"), require("@blue/util"));
	else
		root["blue-view"] = factory(root["@blue/factory"], root["@blue/core"], root["@blue/context"], root["@blue/router"], root["@blue/util"]);
})(globalThis, function(__WEBPACK_EXTERNAL_MODULE__3__, __WEBPACK_EXTERNAL_MODULE__4__, __WEBPACK_EXTERNAL_MODULE__5__, __WEBPACK_EXTERNAL_MODULE__6__, __WEBPACK_EXTERNAL_MODULE__10__) {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/**
 * @author Jeff Rose
 * @module view
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(1), exports);
__exportStar(__webpack_require__(2), exports);
__exportStar(__webpack_require__(7), exports);
__exportStar(__webpack_require__(9), exports);


/***/ }),
/* 1 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/**
 * @author Jeff Rose
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Bridge = void 0;
var defineProperty = Reflect.defineProperty;
// export interface Bridge {
//     id: number;
//     name: string;
//     disable(): void;
//     enable(): void;
//     on(): void;
// }
var Bridge = /** @class */ (function () {
    function Bridge(spec) {
        defineProperty(this, 'spec', {
            value: spec,
            configurable: true,
            enumerable: false,
            writable: false
        });
        this.name = spec.name || "ANONYMOUS BRIDGE";
    }
    Bridge.prototype.disable = function () {
        // not yet implemented
    };
    Bridge.prototype.enable = function () {
        throw new Error("Method not implemented.");
    };
    Bridge.prototype.on = function () {
        throw new Error("Method not implemented.");
    };
    return Bridge;
}());
exports.Bridge = Bridge;


/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/**
 * @author Jeff Rose
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RerouteView = exports.AbstractTemplateView = exports.AbstractPathBasedView = exports.AbstractView = void 0;
var factory_1 = __webpack_require__(3);
var core_1 = __webpack_require__(4);
var context_1 = __webpack_require__(5);
var router_1 = __webpack_require__(6);
var AbstractView = /** @class */ (function (_super) {
    __extends(AbstractView, _super);
    function AbstractView() {
        var _this = _super.call(this) || this;
        _this.mediaType = core_1.MediaTypes.TEXT_HTML.withCharset('UTF-8');
        return _this;
    }
    Object.defineProperty(AbstractView.prototype, Symbol.toStringTag, {
        get: function () {
            return "View:" + this.name;
        },
        enumerable: false,
        configurable: true
    });
    AbstractView.prototype.render = function (model, request) {
        var viewModel = this._createViewModel(model, request);
        this._renderView(viewModel, request);
    };
    AbstractView.prototype.toJSON = function () {
        var json = core_1.createNull();
        json.name = this.name;
        json.mediaType = this.mediaType.toJSON();
        return json;
    };
    AbstractView.prototype.toString = function () {
        return this.name;
    };
    AbstractView.prototype._createViewModel = function (model, request) {
        return model;
    };
    return AbstractView;
}(factory_1.AsNameAware(context_1.AsApplicationContextAware(core_1.Null))));
exports.AbstractView = AbstractView;
// TODO Implement Initializable?
var AbstractPathBasedView = /** @class */ (function (_super) {
    __extends(AbstractPathBasedView, _super);
    function AbstractPathBasedView(path) {
        if (path === void 0) { path = null; }
        var _this = _super.call(this) || this;
        if (path) {
            Reflect.defineProperty(_this, 'path', {
                value: path,
                configurable: true,
                enumerable: false,
                writable: false
            });
        }
        return _this;
    }
    Object.defineProperty(AbstractPathBasedView.prototype, Symbol.toStringTag, {
        get: function () {
            return "PathBasedView:" + this.path;
        },
        enumerable: false,
        configurable: true
    });
    AbstractPathBasedView.prototype.toJSON = function () {
        var json = _super.prototype.toJSON.call(this);
        json.path = this.path;
        return json;
    };
    return AbstractPathBasedView;
}(AbstractView));
exports.AbstractPathBasedView = AbstractPathBasedView;
var AbstractTemplateView = /** @class */ (function (_super) {
    __extends(AbstractTemplateView, _super);
    function AbstractTemplateView() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return AbstractTemplateView;
}(AbstractPathBasedView));
exports.AbstractTemplateView = AbstractTemplateView;
/**
 * View for a web interaction. Implementations are responsible for rendering content, and exposing the model. A single view exposes multiple model attributes.
 *
 * View implementations may differ widely. This interface is designed to avoid restricting the range of possible implementations.
 *
 * They are likely to be instantiated by a {@link module:view.ViewResolver|`ViewResolver`} .
 * @interface module:view.View
 */
/**
 * The media type of the view
 * @member {module:core.MediaType} module:view.View#mediaType
 */
/**
 * Render the view given the specified model.
 * @function module:view.View#render
 * @param {*} model The data model
 * @param {*} request The current request
 */
/**
 * Abstract base class for {@link module:view.View|`View`} implementations. Subclasses need to implement the actual rendering.
 * @abstract
 * @class module:view.AbstractView
 * @implements module:view.View
 * @implements module:core.NameAware
 * @implements module:core.Serializable
 */
/**
 * Abstract base class for path-based views.
 * @abstract
 * @class module:view.AbstractPathBasedView
 * @extends module:view.AbstractView
 */
/**
 * Abstract base class for template-based views.
 * @abstract
 * @class module:view.AbstractTemplateView
 * @extends module:view.AbstractPathBasedView
 */
/**
 * @abstract
 * @protected
 * @function module:view.AbstractTemplateView#_renderTemplate
 * @param {*} templateModel The template data model
 * @param {*} request The current request
 */
/**
 * View that reroutes to an absolute, context relative, or current request relative route.
 * @class module:view.RerouteView
 * @extends module:view.AbstractPathBasedView
 */
var RerouteView = /** @class */ (function (_super) {
    __extends(RerouteView, _super);
    function RerouteView(path, contextRelative) {
        if (contextRelative === void 0) { contextRelative = false; }
        var _this = _super.call(this, path) || this;
        _this.contextRelative = contextRelative;
        return _this;
    }
    RerouteView.prototype._createTargetPath = function (model, request) {
        var data = this.contextRelative ?
            router_1.toMatrixString(model) :
            router_1.toQueryString(model);
        return "" + this.path + data;
    };
    RerouteView.prototype._renderView = function (viewModel, request) {
        var targetPath = this._createTargetPath(viewModel, request);
        // TODO USE ROUTER
        history.pushState(null, null, targetPath);
    };
    return RerouteView;
}(AbstractPathBasedView));
exports.RerouteView = RerouteView;
/*
export interface View extends NameAware {
    id: number;
    mediaType: MediaType;
    timestamp: number;
    context: Context;
    // TODO: Make model into a more formal thing
    model: { [ key: string ]: any };
    spec: { [ key: string ]: any };

    destroy(): void | boolean | Promise<any>;
    trigger( name: string, data: JSONObject ): void;
    onData( name: string, handler: Function, options?: { [ key: string ]: any } ): Function;
    onInit?(): void;
    onDestroy?(): void;
}

// Path-based views
export interface PathBasedView extends View {
    path: string;
}

export interface TemplateView extends PathBasedView {
    readonly template: any;
    rendered: Deferred<any>;

    render( selector: string, data: any, options?: { [ key: string ]: any } ): Promise<void>;
}

export interface WebView extends PathBasedView {
    target: Element;
    element: Element;

    appendTo( selector: string, data: any, options?: { [ key: string ]: any } ): Promise<void>;
    replaceIn( selector: string, data: any, options?: { [ key: string ]: any } ): Promise<void>;
}
*/


/***/ }),
/* 3 */
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__3__;

/***/ }),
/* 4 */
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__4__;

/***/ }),
/* 5 */
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__5__;

/***/ }),
/* 6 */
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__6__;

/***/ }),
/* 7 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/**
 * @author Jeff Rose
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ViewResolverComposite = exports.NameViewResolver = exports.ImportViewResolver = exports.AbstractPathBasedViewResolver = exports.AbstractCachingViewResolver = void 0;
var core_1 = __webpack_require__(4);
var factory_1 = __webpack_require__(3);
var context_1 = __webpack_require__(5);
/**
 * @class module:view.UnresolvedView
 * @implements module:view.View
 */
var UnresolvedView = /** @class */ (function () {
    function UnresolvedView() {
        this.mediaType = null;
    }
    UnresolvedView.prototype.render = function (model, request) {
        return;
    };
    return UnresolvedView;
}());
var defineProperty = Reflect.defineProperty, unresolvedView = new UnresolvedView();
var AbstractCachingViewResolver = /** @class */ (function () {
    function AbstractCachingViewResolver() {
        defineProperty(this, 'cache', {
            value: core_1.createNull(),
            configurable: true,
            enumerable: false,
            writable: false
        });
        this.isCaching = true;
    }
    AbstractCachingViewResolver.prototype.resolveViewName = function (name, language) {
        return __awaiter(this, void 0, Promise, function () {
            var view, key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.isCaching) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._createView(name, language)];
                    case 1:
                        view = _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        key = this._createCacheKey(name, language);
                        view = this.cache[key];
                        if (!!view) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._createView(name, language)];
                    case 3:
                        view = _a.sent();
                        if (!view) {
                            view = unresolvedView;
                        }
                        else {
                            this.cache[key] = view;
                        }
                        _a.label = 4;
                    case 4: return [2 /*return*/, view === unresolvedView ? null : view];
                }
            });
        });
    };
    AbstractCachingViewResolver.prototype._createView = function (name, language) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._loadView(name, language)];
            });
        });
    };
    AbstractCachingViewResolver.prototype._createCacheKey = function (name, language) {
        return "" + name + (language ? '_' + language : '');
    };
    return AbstractCachingViewResolver;
}());
exports.AbstractCachingViewResolver = AbstractCachingViewResolver;
var AbstractPathBasedViewResolver = /** @class */ (function (_super) {
    __extends(AbstractPathBasedViewResolver, _super);
    function AbstractPathBasedViewResolver() {
        var _this = _super.call(this) || this;
        _this.mediaType = core_1.MediaTypes.APPLICATION_JAVASCRIPT;
        _this.prefix = '';
        _this.suffix = '';
        _this.viewNames = null;
        return _this;
    }
    AbstractPathBasedViewResolver.prototype.supports = function (name, language) {
        var isSupported = !!this.viewNames;
        if (!isSupported) {
            isSupported = this.viewNames.some(function (viewName) {
                if (viewName instanceof RegExp) {
                    return viewName.test(name);
                }
                else if (typeof viewName === 'string') {
                    return viewName === name;
                }
            });
        }
        return isSupported;
    };
    AbstractPathBasedViewResolver.prototype._buildView = function (name) {
        // TODO Update this to represent how views are really created
        // As a result this could become async
        var ViewClass = this.viewClass, view = new ViewClass("" + this.prefix + name + this.suffix);
        view.mediaType = this.mediaType;
        return view;
    };
    return AbstractPathBasedViewResolver;
}(AbstractCachingViewResolver));
exports.AbstractPathBasedViewResolver = AbstractPathBasedViewResolver;
/**
 * Interface to be implemented by objects that can resolve views by name.
 *
 * View state doesn't change during the running of the application, so implementations are free to cache views.
 *
 * Implementations are encouraged to support internationalization, i.e. localized view resolution.
 * @interface module:view.ViewResolver
 */
/**
 * Resolve the given view by name.
 *
 * To allow for ViewResolver chaining, a ViewResolver should return `null` if a view with the given name is not defined in it.
 * @function module:view.ViewResolver#resolveViewName
 * @param {external:string} viewName The name of the view to resolve.
 * @param {*} [language]
 * @returns {module:view.View} The resolved view.
 */
/**
 * Convenient base class for {@link module:view.ViewResolver|`ViewResolver`} implementations. Caches {@link module:view.View|`View`} instances once resolved.
 * Subclasses need to implement the {@link module:view.ViewResolver#loadView|`loadView`} method, building the instance for the specific view name and locale.
 * @abstract
 * @class module:view.AbstractCachingViewResolver
 * @implements module:view.ViewResolver
 * @see {@link module:view.ViewResolver#loadView}
 */
/**
 * @abstract
 * @class module:view.AbstractPathBasedViewResolver
 * @extends module:view.AbstractCachingViewResolver
 */
/**
 * @class module:view.ImportViewResolver
 * @extends module:view.AbstractPathBasedViewResolver
 */
var ImportViewResolver = /** @class */ (function (_super) {
    __extends(ImportViewResolver, _super);
    function ImportViewResolver() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ImportViewResolver.prototype._loadView = function (name, language) {
        return __awaiter(this, void 0, Promise, function () {
            var path, ViewClass;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        path = "" + this.prefix + name + this.suffix;
                        return [4 /*yield*/, Promise.resolve().then(function () { return __webpack_require__(8)(path); }).then(function (module) { return module.default; })];
                    case 1:
                        ViewClass = _a.sent();
                        console.log('View', name, ViewClass);
                        return [2 /*return*/, new ViewClass()];
                }
            });
        });
    };
    return ImportViewResolver;
}(AbstractPathBasedViewResolver));
exports.ImportViewResolver = ImportViewResolver;
/**
 * A simple implementation of {@link module:view.ViewResolver|`ViewResolver`} that interprets a view name as a value in the current application context.
 *
 * This resolver can be handy for small applications, keeping all definitions ranging from controllers to views in the same place.
 * @class module:view.NameViewResolver
 * @implements module:view.ViewResolver
 */
var NameViewResolver = /** @class */ (function (_super) {
    __extends(NameViewResolver, _super);
    function NameViewResolver() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NameViewResolver.prototype.resolveViewName = function (name, language) {
        return __awaiter(this, void 0, Promise, function () {
            var applicationContext, view;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        applicationContext = this.applicationContext;
                        view = null;
                        if (applicationContext.hasValue(name)) {
                            view = applicationContext.getValue(name);
                        }
                        return [4 /*yield*/, view];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return NameViewResolver;
}(context_1.AsApplicationContextAware(core_1.Null)));
exports.NameViewResolver = NameViewResolver;
/**
 * A {@link module:view.ViewResolver|`ViewResolver`} that delegates to others.
 * @class module:view.ViewResolverComposite
 * @implements module:core.Initializable
 * @implements module:core.ViewResolver
 * @mixes module:context.AsApplicationContextAware
 * @extends module:core.Null
 */
var ViewResolverComposite = /** @class */ (function (_super) {
    __extends(ViewResolverComposite, _super);
    function ViewResolverComposite(viewResolvers) {
        if (viewResolvers === void 0) { viewResolvers = []; }
        var _this = _super.call(this) || this;
        defineProperty(_this, 'viewResolvers', {
            value: viewResolvers,
            configurable: true,
            enumerable: false,
            writable: false
        });
        return _this;
    }
    ViewResolverComposite.prototype.init = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var viewResolvers = this.viewResolvers;
        length = viewResolvers.length;
        if (length) {
            var index = 0;
            for (; index < length; index++) {
                var viewResolver = viewResolvers[index];
                if (factory_1.likeInitializable(viewResolver)) {
                    viewResolver.init(args);
                }
            }
        }
    };
    ViewResolverComposite.prototype.resolveViewName = function (name, language) {
        return __awaiter(this, void 0, Promise, function () {
            var viewResolvers, index, viewResolver, view;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        viewResolvers = this.viewResolvers;
                        length = viewResolvers.length;
                        if (!length) return [3 /*break*/, 4];
                        index = 0;
                        _a.label = 1;
                    case 1:
                        if (!(index < length)) return [3 /*break*/, 4];
                        viewResolver = viewResolvers[index];
                        return [4 /*yield*/, viewResolver.resolveViewName(name, language)];
                    case 2:
                        view = _a.sent();
                        if (view) {
                            return [2 /*return*/, view];
                        }
                        _a.label = 3;
                    case 3:
                        index++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, null];
                }
            });
        });
    };
    ViewResolverComposite.prototype.setApplicationContext = function (applicationContext) {
        var viewResolvers = this.viewResolvers;
        length = viewResolvers.length;
        if (length) {
            var index = 0;
            for (; index < length; index++) {
                var viewResolver = viewResolvers[index];
                if (context_1.likeApplicationContextAware(viewResolver)) {
                    viewResolver.setApplicationContext(applicationContext);
                }
            }
        }
    };
    return ViewResolverComposite;
}(context_1.AsApplicationContextAware(core_1.Null)));
exports.ViewResolverComposite = ViewResolverComposite;


/***/ }),
/* 8 */
/***/ ((module) => {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = () => ([]);
webpackEmptyContext.resolve = webpackEmptyContext;
webpackEmptyContext.id = 8;
module.exports = webpackEmptyContext;

/***/ }),
/* 9 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/**
 * @author Jeff Rose
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.ContentNegotiationViewResolver = exports.ContentNegotiationManager = exports.PathExtensionContentNegotiationStrategy = exports.AbstractMappingContentNegotiationStrategy = exports.FixedContentNegotiationStrategy = exports.MappingMediaTypeFileExtensionResolver = exports.likeMediaTypeFileExtensionResolver = void 0;
var core_1 = __webpack_require__(4);
var util_1 = __webpack_require__(10);
/**
 * Strategy to resolve {@link module:core.MediaType} to a list of file extensions.
 * For example resolve "application/json" to "json".
 * @interface module:view.MediaTypeFileExtensionResolver
 */
var isDefined = util_1.complement(util_1.isNil), hasFunction = util_1.propSatisfies(util_1.isFunction), hasGetAllFileExtenstions = hasFunction('getAllFileExtenstions'), hasResolveFileExtensions = hasFunction('resolveFileExtensions');
var likeMediaTypeFileExtensionResolver = function (value) { return util_1.allPass([isDefined, hasGetAllFileExtenstions, hasResolveFileExtensions])(value); };
exports.likeMediaTypeFileExtensionResolver = likeMediaTypeFileExtensionResolver;
var MappingMediaTypeFileExtensionResolver = /** @class */ (function () {
    function MappingMediaTypeFileExtensionResolver(mediaTypes) {
        this.mediaTypes = new Map();
        this.fileExtensions = new core_1.MultiValueMap();
        this.allFileExtensions = [];
        if (mediaTypes && mediaTypes.size) {
            mediaTypes.forEach(function (mediaType, extension) {
                var lowerCaseExtension = extension.toLowerCase();
                this.mediaTypes.set(lowerCaseExtension, mediaType);
                this.fileExtensions.add(mediaType, lowerCaseExtension);
                this.allFileExtensions.push(lowerCaseExtension);
            }, this);
        }
    }
    MappingMediaTypeFileExtensionResolver.prototype.getAllFileExtenstions = function () {
        return this.allFileExtensions;
    };
    MappingMediaTypeFileExtensionResolver.prototype.getAllMediaTypes = function () {
        return __spreadArray([], this.mediaTypes.values());
    };
    MappingMediaTypeFileExtensionResolver.prototype.lookupMediaType = function (extension) {
        return this.mediaTypes.get(extension.toLowerCase());
    };
    MappingMediaTypeFileExtensionResolver.prototype.resolveFileExtensions = function (mediaType) {
        return this.fileExtensions.get(mediaType);
    };
    return MappingMediaTypeFileExtensionResolver;
}());
exports.MappingMediaTypeFileExtensionResolver = MappingMediaTypeFileExtensionResolver;
var FixedContentNegotiationStrategy = /** @class */ (function () {
    function FixedContentNegotiationStrategy(mediaTypes) {
        this.mediaTypes = Array.isArray(mediaTypes) ?
            mediaTypes :
            [mediaTypes];
    }
    FixedContentNegotiationStrategy.prototype.resolveMediaTypes = function (request) {
        return this.mediaTypes;
    };
    return FixedContentNegotiationStrategy;
}());
exports.FixedContentNegotiationStrategy = FixedContentNegotiationStrategy;
var AbstractMappingContentNegotiationStrategy = /** @class */ (function (_super) {
    __extends(AbstractMappingContentNegotiationStrategy, _super);
    function AbstractMappingContentNegotiationStrategy() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AbstractMappingContentNegotiationStrategy.prototype.resolveMediaTypes = function (request) {
        throw new Error("Method not implemented.");
    };
    AbstractMappingContentNegotiationStrategy.prototype.resolveMediaTypeKey = function (request, key) {
        return null;
    };
    return AbstractMappingContentNegotiationStrategy;
}(MappingMediaTypeFileExtensionResolver));
exports.AbstractMappingContentNegotiationStrategy = AbstractMappingContentNegotiationStrategy;
var PathExtensionContentNegotiationStrategy = /** @class */ (function () {
    function PathExtensionContentNegotiationStrategy() {
    }
    PathExtensionContentNegotiationStrategy.prototype.resolveMediaTypes = function (request) {
        throw new Error("Method not implemented.");
    };
    return PathExtensionContentNegotiationStrategy;
}());
exports.PathExtensionContentNegotiationStrategy = PathExtensionContentNegotiationStrategy;
var ContentNegotiationManager = /** @class */ (function () {
    function ContentNegotiationManager(strategies) {
        if (strategies === void 0) { strategies = []; }
        this.resolvers = [];
        this.strategies = strategies;
        this.strategies.forEach(function (strategy) {
            exports.likeMediaTypeFileExtensionResolver(strategy) && this.resolvers.push(strategy);
        }, this);
    }
    ContentNegotiationManager.prototype.getAllFileExtenstions = function () {
        throw new Error("Method not implemented.");
    };
    ContentNegotiationManager.prototype.resolveFileExtensions = function (mediaType) {
        throw new Error("Method not implemented.");
    };
    ContentNegotiationManager.prototype.resolveMediaTypes = function (request) {
        throw new Error("Method not implemented.");
    };
    return ContentNegotiationManager;
}());
exports.ContentNegotiationManager = ContentNegotiationManager;
var ContentNegotiationViewResolver = /** @class */ (function () {
    function ContentNegotiationViewResolver(manager) {
        this.contentNegotiationManager = manager;
    }
    ContentNegotiationViewResolver.prototype.getMediaTypes = function (request) {
        this.contentNegotiationManager;
        return null;
    };
    ContentNegotiationViewResolver.prototype.resolveViewName = function (name, language) {
        throw new Error("Method not implemented.");
    };
    return ContentNegotiationViewResolver;
}());
exports.ContentNegotiationViewResolver = ContentNegotiationViewResolver;


/***/ }),
/* 10 */
/***/ ((module) => {

"use strict";
module.exports = __WEBPACK_EXTERNAL_MODULE__10__;

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/************************************************************************/
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/
/************************************************************************/
/******/
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/
/******/ 	return __webpack_exports__;
/******/ })()
;
});
