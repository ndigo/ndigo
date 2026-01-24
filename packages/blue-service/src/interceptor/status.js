/**
 * @author Aaron Brown
 * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
 * @classdesc
 * React to service response according to status code and associated callbacks provided in settings.
 *
 * Redirection is handled automatically for up to 3 redirect responses. Any further redirects will
 * execute the error response handler. To disable the redirect handler, add this to the service
 * request settings:
 * * redirect: false
 *
 * Some options can be defined in the service request "settings" object to configure behavior of the interceptor:
 * * handleSuccess: function( data ){ return data; }
 * * handleError: function( response ){ // do whatever is needed }
 * * handleStatus: {
 * 						'500': function( response ){ // do whatever },
 * 						'404': function( response ){ // do whatever },
 * 						// etc.
 *                 }
 *
 * In case of a success response from the server, the interceptor will first look for "handleSuccess"
 * in settings. If not found, it will look for "handleStatus[ '200' ]". If that is not found, the
 * server data is passed through untouched.
 *
 * The handleSuccess callback takes response data as an argument and should return data. The return
 * value is what is provided back to the original service request code.
 *
 * The handleError and handleStatus callbacks take the full server response as an argument and do
 * not return any values. Once the callback has completed executing, the service request promise will
 * be rejected, allowing any "catch" blocks in the app code to execute.
 *
 * If both "handleError" and the specific code handler are defined, both will execute. The generic
 * "handleError" will execute first, followed by "handleStatus[ 'xxx' ]".
 *
 * Remember that a redirect status code counts as an error. In the case of a chain of redirects longer
 * than three, the error handler will execute with that redirect status code.
 */
define( function(){
    'use strict';

    var	redirectMax = 3,
        redirectCodes = {
            '300': true,
            '301': true,
            '302': true,
            '303': true,
            '305': true,
            '306': true,
            '307': true,
            '308': true
        },
        // determine if a function has been provided at given path
        getFunction = function( obj, path ){
            var parts = path.split( '.' );
            while( obj = obj[ parts.shift() ] ){
                if( obj.constructor === Function ){
                    return obj;
                }
            }
        };

    return {
        around: function statusInterceptor( joinpoint ){
            var	cnt = 1,
                settings = joinpoint.args[ 0 ];
            return new Promise( function( resolve, reject ){
                var placeRequest = function(){
                    joinpoint.proceed()
                        .then( function( response ){
                            var func = getFunction( settings, 'handleSuccess' );
                            if( func ){
                                return resolve( func.call( response, response ) );
                            }
                            if( func = getFunction( settings, 'handleStatus.200' ) ){
                                func.call( response, response );
                            }
                            resolve( response );
                        } )
                        .catch( function( response ){
                            var func,
                                status = response.status,
                                isRedirect = redirectCodes[ status ];

                            if( isRedirect && settings.redirect && cnt++ < redirectMax ){
                                // update location
                                // we may want to clone settings object before manipulating it
                                settings.url = response.getResponseHeader( 'Location' );
                                // try again
                                return placeRequest();
                            }

                            if( func = getFunction( settings, 'handleError' ) ){
                                func.call( response, response );
                            }
                            if( func = getFunction( settings, 'handleStatus.' + status ) ){
                                func.call( response, response );
                            }
                            reject( response );
                        } );
                };
                placeRequest();
            } );
        }
    };
} );
