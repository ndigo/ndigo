/**
 * @author Ben White
 * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
 */
define( function(){
    'use strict';
    var queue = [],
        // process directive from application
        callback = function( retry ){
            var request,
                requests = [];
            // move queued requests into temp array
            while( request = queue.shift() ){ requests.push( request ); }
            // process each queued request
            requests.forEach( function( request ){
                request( retry );
            } );
        },
        // create simple method that contains all the required refs
        requestFactory = function( joinpoint, resolve, reject, context, handler ){
            var exception,
                request = function( retry ){
                    if( !retry ){
                        return reject( exception );
                    }
                    // call service
                    joinpoint.proceed()
                        .then( resolve )
                        .catch( function( response ){
                            // if online then pass reject through
                            if( !context.env || !( 'onLine' in context.env ) || context.env.onLine ){
                                return reject( response );
                            }
                            // queue request
                            queue.push( request );
                            // save exception
                            exception = response;
                            // give error handler the ability to re-request or cancel
                            queue.length === 1 && handler( callback );
                        } );
                };
            return request;
        };

    /**
     * This interceptor will tell the application when a service call fails due to a device being offline. It supports request retry and cancel functionality.
     * @const {module:blue-core.Interceptor} module:blue-app.offlineInterceptor
     */
    return {
        around: function( joinpoint ){
            var settings = joinpoint.args[ 0 ] || {},
                disabled = settings.disableOfflineHandler,
                context = joinpoint.target.context,
                handler = context.onOfflineError;
            // check for offline handler
            if( disabled || !handler ){
                // short circuit offline functionality
                return joinpoint.proceed();
            }
            // manage the request
            return new Promise( function( resolve, reject ){
                // call service
                requestFactory( joinpoint, resolve, reject, context, handler )( true );
            } );
        }
    };
} );
