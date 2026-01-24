import { JavaScriptFeatures } from './javascript-features';
import { NodeFeatures } from './node-features';
import { WebFeatures } from './web-features';

export interface JavaScriptAPIs extends JavaScriptFeatures {
    async_await?: boolean;
    arrow?: boolean;
    class_decorators?: boolean;
    classes?: boolean;
    decorators?: boolean;
    es5?: boolean;
    es5_array?: boolean;
    es5_date?: boolean;
    es5_function?: boolean;
    es5_object?: boolean;
    es5_string?: boolean;
    es5_syntax?: boolean;
    es5_undefined?: boolean;
    es6?: boolean;
    es6_array?: boolean;
    es6_collections?: boolean;
    es6_math?: boolean;
    es6_number?: boolean;
    es6_object?: boolean;
    es6_promise?: boolean;
    es6_reflect?: boolean;
    es6_regexp?: boolean;
    es6_string?: boolean;
    es6_symbol?: boolean;
    es7?: boolean;
    es7_array?: boolean;
    es7_string?: boolean;
    es8?: boolean;
    es8_object?: boolean;
    es8_string?: boolean;
    es9?: boolean;
    es9_promise?: boolean;
    es9_symbol?: boolean;
    es10?: boolean;
    es10_array?: boolean;
    es10_object?: boolean;
    es10_string?: boolean;
    es10_symbol?: boolean;
    es11?: boolean;
    es11_promise?: boolean;
    es11_string?: boolean;
    es12?: boolean;
    es12_promise?: boolean;
    es12_string?: boolean;
    generators?: boolean;
    infix_operator?: boolean;
    method_decorators?: boolean;
    reflect_metadata_api?: boolean;
    regexp_flags?: boolean;
    strict_mode?: boolean;
    template_literals?: boolean;
}

export interface NodeAPIs extends NodeFeatures {

}

export interface WebAPIs extends WebFeatures {
    abort_api?: boolean;
    ambient_light_events?: boolean;
    background_task_api?: boolean;
    clipboard_api?: boolean;
    cookies?: boolean;
    cors?: boolean;
    frame_timing_api?: boolean;
    fullscreen_api?: boolean;
    framed?: boolean;
    navigation_timing_api?: boolean;
    network_information_api?: boolean;
    notifications_api?: boolean;
    page_visibility_api?: boolean;
    performance_api?: boolean;
    permissions_api?: boolean;
    pointer_events?: boolean;
    pointer_lock_api?: boolean;
    proximity_events?: boolean;
    resource_timing_api?: boolean;
    symbol_description?: boolean;
    touch_events?: boolean;
    user_timing_api?: boolean;
    web_animations_api?: boolean;
    web_storage_api?: boolean;
    xmlhttprequest?: boolean;
    xmlhttprequest_abort?: boolean;
    xmlhttprequest_open?: boolean;
    xmlhttprequest_send?: boolean;
    xmlhttprequest_withcredentials?: boolean;
}

export interface Has extends JavaScriptAPIs, NodeAPIs, WebAPIs {}

/**
 * @interface module:has.JavaScriptAPIs
 * @extends module:has.JavaScriptFeatures
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#async_await
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#arrow
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#class_decorators
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#classes
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#decorators
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es5
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es5_array
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es5_date
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es5_function
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es5_object
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es5_string
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es5_syntax
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es5_undefined
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es6
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es6_array
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es6_collections
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es6_math
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es6_number
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es6_object
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es6_promise
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es6_reflect
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es6_regexp
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es6_string
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es6_symbol
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es7
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es7_array
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es7_string
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es8
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es8_object
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es8_string
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es9
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es9_promise
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es9_symbol
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es10
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es10_array
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es10_object
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es10_string
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es10_symbol
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es11
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es11_promise
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es11_string
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es12
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es12_promise
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#es12_string
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#generators
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#infix_operator
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#method_decorators
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#reflect_metadata_api
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#regexp_flags
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#strict_mode
 */

/**
 * @member {external:boolean} module:has.JavaScriptAPIs#template_literals
 */

/**
 * @interface module:has.NodeAPIs
 * @extends module:has.NodeFeatures
 */

/**
 * @interface module:has.WebAPIs
 * @extends module:has.WebFeatures
 */

/**
 * @member {external:boolean} module:has.WebAPIs#abort_api
 */

/**
 * @member {external:boolean} module:has.WebAPIs#ambient_light_events
 */

/**
 * @member {external:boolean} module:has.WebAPIs#background_task_api
 * @see {@link https://www.w3.org/TR/requestidlecallback/}
 */

/**
 * @member {external:boolean} module:has.WebAPIs#clipboard_api
 */

/**
 * @member {external:boolean} module:has.WebAPIs#cookies
 */

/**
 * @member {external:boolean} module:has.WebAPIs#cors
 */

/**
 * @member {external:boolean} module:has.WebAPIs#frame_timing_api
 */

/**
 * @member {external:boolean} module:has.WebAPIs#fullscreen_api
 */

/**
 * @member {external:boolean} module:has.WebAPIs#framed
 */

/**
 * @member {external:boolean} module:has.WebAPIs#navigation_timing_api
 */

/**
 * @member {external:boolean} module:has.WebAPIs#network_information_api
 */

/**
 * @member {external:boolean} module:has.WebAPIs#notifications_api
 */

/**
 * @member {external:boolean} module:has.WebAPIs#page_visibility_api
 */

/**
 * @member {external:boolean} module:has.WebAPIs#performance_api
 */

/**
 * @member {external:boolean} module:has.WebAPIs#permissions_api
 */

/**
 * @member {external:boolean} module:has.WebAPIs#pointer_events
 */

/**
 * @member {external:boolean} module:has.WebAPIs#pointer_lock_api
 */

/**
 * @member {external:boolean} module:has.WebAPIs#proximity_events
 */

/**
 * @member {external:boolean} module:has.WebAPIs#resource_timing_api
 */

/**
 * @member {external:boolean} module:has.WebAPIs#symbol_description
 */

/**
 * @member {external:boolean} module:has.WebAPIs#touch_events
 */

/**
 * @member {external:boolean} module:has.WebAPIs#user_timing_api
 */

/**
 * @member {external:boolean} module:has.WebAPIs#web_animations_api
 */

/**
 * @member {external:boolean} module:has.WebAPIs#web_storage_api
 */

/**
 * @member {external:boolean} module:has.WebAPIs#xmlhttprequest
 */

/**
 * @member {external:boolean} module:has.WebAPIs#xmlhttprequest_abort
 */

/**
 * @member {external:boolean} module:has.WebAPIs#xmlhttprequest_open
 */

/**
 * @member {external:boolean} module:has.WebAPIs#xmlhttprequest_send
 */

/**
 * @member {external:boolean} module:has.WebAPIs#xmlhttprequest_withcredentials
 */

/**
 * @interface module:has.Has
 * @extends module:has.JavaScriptAPIs
 * @extends module:has.NodeAPIs
 * @extends module:has.WebAPIs
 */

const
    hasReflect = typeof Reflect === 'object',
    hasReflectDefineProperty = hasReflect && typeof Reflect.defineProperty === 'function',
    hasReflectDeleteProperty = hasReflect && typeof Reflect.deleteProperty === 'function',
    hasReflectSetPrototypeOf = hasReflect && typeof Reflect.setPrototypeOf === 'function',

    defineProperty = hasReflectDefineProperty ?
        Reflect.defineProperty :
        Object.defineProperty,
    deleteProperty = hasReflectDeleteProperty ?
        Reflect.deleteProperty :
        ( target: object, key: PropertyKey ) => delete target[ key ],
    setPrototypeOf = hasReflectSetPrototypeOf ?
        Reflect.setPrototypeOf :
        Object.setPrototypeOf,
    keys = Object.keys,
    createNull = Object.create.bind( Object, null );

export const defineReadOnlyProperty = <T = any>( target: object, propertyKey: PropertyKey, value: T ) => defineProperty( target, propertyKey, {
    value: value,
    configurable: true,
    enumerable: true,
    writable: false
} );

/**
 * The `prototype` of {@link module:has.has} on which feature detectors are defined.
 * @const {module:has.Has} module:has~had
 */
export const had: Has = createNull();

/**
 * @const {module:has.Has} module:has.has
 */
export const has: Has = createNull();
setPrototypeOf( has, had );

defineReadOnlyProperty( has, 'reflect', hasReflect );
defineReadOnlyProperty( has, 'reflect_defineproperty', hasReflectDefineProperty );
defineReadOnlyProperty( has, 'reflect_deleteproperty', hasReflectDeleteProperty );
defineReadOnlyProperty( has, 'reflect_setprototypeof', hasReflectSetPrototypeOf );

/**
 * Defines a feature detector on {@link module:has~had}. When the feature detection runs, the results are cached on {@link module:has.has}.
 * @function module:has.defineDetector
 * @param {external:string} id
 * @param {external:Function} test
 */
export const defineDetector = ( id: string, test: ( has: Has ) => boolean ) => {
    defineProperty( had, id, {
        get: function(){
            let result = false;
            try {
                result = test( has );
            } catch( e ){}
            defineReadOnlyProperty( has, id, result );
            return result;
        },
        configurable: true,
        enumerable: true
    } );
};

/**
 * @function module:has.defineDetectors
 * @param {external:Function} tests
 */
export const defineDetectors = ( tests: ( has: Has ) => { [ id: string ]: () => boolean } ) => {
    const
        detectors = tests( has ),
        define = ( id ) => defineDetector( id, detectors[ id ] );
    keys( detectors ).forEach( define );
};

/**
 * @function module:has.resetDetector
 * @param {external:string} id
 */
export const resetDetector = ( id: string ) => {
    deleteProperty( has, id );
};
