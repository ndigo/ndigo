import detectWebFeatures from './detect-features';
import { defineDetector, defineDetectors } from '../has';

export default () => {
    detectWebFeatures();

    defineDetector( 'abort_api', ( has ) => has.abortcontroller && has.abortsignal );
    defineDetector( 'ambient_light_events', ( has ) => has.ondevicelight );
    defineDetector( 'background_task_api', ( has ) => has.cancelidlecallback && has.requestidlecallback );
    defineDetector( 'notifications_api', ( has ) => has.notification );
    // performance.timing and performance.navigation are now deprecated
    defineDetector( 'performance_api', ( has ) => has.performance_now && has.performance_tojson );
    defineDetector( 'pointer_events', ( has ) => has.onpointercancel && has.onpointerdown && has.onpointerenter && has.onpointerleave && has.onpointermove && has.onpointerout && has.onpointerover && has.onpointerup && has.ongotpointercapture && has.onlostpointercapture );
    defineDetector( 'proximity_events', ( has ) => has.ondeviceproximity && has.onuserproximity );
    defineDetector( 'touch_events', ( has ) => has.ontouchcancel && has.ontouchend && has.ontouchmove && has.ontouchstart );
    defineDetector( 'web_storage_api', ( has ) => has.localstorage && has.sessionstorage );

    defineDetectors( function( has ){
        const result = {};
        if( has.document_body && has.document_createelement && has.document_defaultview ){
            const
                inputTypes = 'search tel url email datetime date month week time datetime-local number range color'.split( ' ' ),
                iframeAttrs = 'sandbox seamless srcdoc'.split( ' ' ),

                createElement = document.createElement.bind( document ),

                iframe = createElement( 'iframe' ),
                input = createElement( 'input' ),
                textarea = createElement( 'textarea' ),

                iframeLength = iframeAttrs.length,
                inputLength = inputTypes.length,

                TEST_VALUE = '__TEST__';

            let supported = false,
                index = 0;

            for( ; index < inputLength; index++ ){
                const type = inputTypes[ index ];
                input.setAttribute( 'type', type );

                supported = input.type !== 'text';

                if( supported ){
                    input.value = TEST_VALUE;
                    input.style.cssText = 'position:absolute;visibility:hidden;';

                    switch( type ){
                        case 'search':
                        case 'tel':
                            break;
                        case 'email':
                        case 'url':
                            supported = input.checkValidity && input.checkValidity() === false;
                            break;
                        case 'range':
                            if( input.style.webkitAppearance !== undefined ){
                                const
                                    body = document.body,
                                    defaultView: Window = document.defaultView;

                                body.appendChild( input );

                                supported =
                                    // Safari 2-4 allows the test value despite making a slider
                                    has.getcomputedstyle && defaultView.getComputedStyle( input, null ).webkitAppearance !== 'textfield'
                                        // Mobile android web browser has false positive. Check height to see if the input is actually there.
                                        && input.offsetHeight !== 0;

                                body.removeChild( input );
                            }
                        default:
                            supported = input.value !== TEST_VALUE;
                            break;
                    }
                }

                result[ `element_input_${ type }` ] = () => !!supported;
            }

            result[ 'element_input_placeholder' ] = () => 'placeholder' in input;
            result[ 'element_textarea_placeholder' ] = () => 'placeholder' in textarea;

            for( index = 0; index < iframeLength; index++ ){
                const attr: string = iframeAttrs[ index ];
                result[ 'element_iframe_${ attr }' ] = () => attr in iframe;
            }
        }

        return result;
    } );

    defineDetector( 'cookies', ( has ) => has.document_cookie && has.navigator_cookieenabled ? navigator.cookieEnabled : true );
    defineDetector( 'fullscreen_api', ( has ) => has.document_exitfullscreen && has.document_fullscreenelement && has.document_fullscreenenabled && has.document_onfullscreenchange && has.document_onfullscreenerror && has.document_documentelement_requestfullscreen );
    defineDetector( 'page_visibility_api', ( has ) => has.document_hidden && has.document_onvisibilitychange && has.document_visibilitystate );
    defineDetector( 'pointer_lock_api', ( has ) => has.document_exitpointerlock && has.document_requestpointerlock && has.onpointerlockchange && has.onpointerlockerror );
    defineDetector( 'web_animations_api', ( has ) => has.document_getanimations && has.document_timeline && has.document_documentelement_animate );

    defineDetectors( function( has ){
        let supported = true;

        if( has.localstorage ){
            try {
                localStorage.setItem( 'has', 'has' );
                if( localStorage.getItem( 'has' ) !== 'has' ){
                    supported = false;
                } else {
                    localStorage.removeItem( 'has' );
                }
            } catch( e ){
                supported = false;;
            }
        }

        return { 'localstorage': () => supported };
    } );

    defineDetector( 'clipboard_api', ( has ) => has.navigator && has.navigator_clipboard );
    defineDetector( 'network_information_api', ( has ) => has.navigator && has.navigator_connection );
    defineDetector( 'permissions_api', ( has ) => has.navigator && has.navigator_permissions );

    defineDetectors( function( has ){
        const
            isArray = has.array_isarray ?
                Array.isArray :
                ( value: any ): value is Array<any> => value instanceof Array,

            result = {};

        result[ 'frame_timing_api' ] = () => has.performance_getentriesbytype && isArray( performance.getEntriesByType( 'frame' ) ) && has.performanceobserver;
        result[ 'navigation_timing_api' ] = () => has.performance_getentriesbytype && isArray( performance.getEntriesByType( 'navigation' ) );
        result[ 'resource_timing_api' ] = () => has.performance_getentriesbytype && isArray( performance.getEntriesByType( 'resource' ) );
        result[ 'user_timing_api' ] = () => has.performance_getentriesbytype && isArray( performance.getEntriesByType( 'mark' ) ) && isArray( performance.getEntriesByType( 'measure' ) ) && has.performance_clearmarks && has.performance_clearmeasures && has.performance_mark && has.performance_measure;

        return result;
    } );

    defineDetectors( function( has ){
        let supported = true;

        if( has.sessionstorage ){
            try {
                sessionStorage.setItem( 'has', 'has' );
                if( sessionStorage.getItem( 'has' ) !== 'has' ){
                    supported = false;
                } else {
                    sessionStorage.removeItem( 'has' );
                }
            } catch( e ){
                supported = false;;
            }
        }

        return { 'sessionstorage': () => supported };
    } );

    defineDetector( 'framed', ( has ) => has.window && has.top && window.location !== top.location );

    defineDetectors( function( has ){
        const result = {};
        if( has.xmlhttprequest ){
            const xhr = new XMLHttpRequest();
            result[ 'xmlhttprequest_abort' ] = () => typeof xhr.abort === 'function';
            result[ 'xmlhttprequest_open' ] = () => typeof xhr.open === 'function';
            result[ 'xmlhttprequest_send' ] = () => typeof xhr.send === 'function';
            result[ 'xmlhttprequest_withcredentials' ] = () => typeof xhr.withCredentials === 'boolean';
            result[ 'cors' ] = () => has.xmlhttprequest_withcredentials;
        }
        return result;
    } );
};
