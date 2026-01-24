/**
 * @author Aaron Brown
 * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
 */
/* eslint-disable complexity */
/* eslint-disable one-var */
define( function( require ){
    'use strict';

    var logger = require( 'blue/log' )( '[blue:app]' ),
        isHighPriorityResponse = function( response ){
            // BLUEJS-1987
            if( response.status === 401 ){
                return true;
            }

            // BLUEJS-1947
            if( response.status === 403 && response.responseJSON && response.responseJSON.attributes && response.responseJSON.attributes.userType && response.responseJSON.attributes.userType === 'FinancialAdvisor' ){
                return true;
            }

            return false;
        },
        sendErrorMessage = function( context, settings, response, status ){
            var errorBubbleMessage = {},
                errorBroadcastMessage = {
                    value: status || '',
                    request: settings,
                    response: response
                },
                clone = context.util.object.deepClone;

            context.application.broadcast( 'serviceError', errorBroadcastMessage );

            errorBubbleMessage = clone( errorBroadcastMessage );
            errorBubbleMessage.code = 'blue:error:service:requestFailed';

            context.bubble( errorBubbleMessage.code , errorBubbleMessage );
        };

    return {
        around: function errorInterceptor( joinpoint ){
            var APP_RESET_HEADER = 'Alt-Location',
                SUPPORT_ID = 'Support-Id',
                noop = function(){},
                settings = joinpoint.args[ 0 ],
                serviceContext = joinpoint.target.context,
                disableDefaultError = !!settings.disableDefaultError,
                retryStatusCodes = settings.retryStatusCodes || [],
                retryHeader = settings.retryHeader || '',
                isRetryStatus = function( resStatusCode ){
                    if( Array.isArray( retryStatusCodes ) && retryStatusCodes.length > 0 && retryStatusCodes.indexOf( resStatusCode ) < 0 ){
                        return false;
                    }
                    return true;
                };

            return new Promise( function( resolve, reject ){
                joinpoint.proceed().then( function( data ){
                    // service request succeeded
                    resolve( data );
                } ).catch( function( response ){
                    var status, supportId, statusText, redirectUrl,
                        errorResponse = response instanceof Error;

                    // BLUEJS-4680 - when response carries special retry status code (often 503) and
                    // also a header that indicates the time to wait before retry (often "Retry-After"),
                    // then immediately pass through the rejected promise without broadcasting an error
                    // on context. A downstream retry interceptor should catch this response and handle it.
                    // TODO - this feature would work much more efficiently if "retryOnError" interceptor
                    // is added to the default service interceptor stack in the framework. It should be
                    // included so that it captures the response first, before any other interceptors, so
                    // the framework can retry as often as needed before giving up and rejecting the request.
                    // Once the request is rejected, the rest of the interceptors (including this one) can
                    // operate the way they used to, without any knowledge of retry headers and behavior.
                    if( !errorResponse && isRetryStatus( response.status ) && response.getResponseHeader( retryHeader ) ){
                        reject( response );
                    } else {
                        if( !errorResponse ){
                            response = response || { getResponseHeader: noop };

                            status = response.status;
                            statusText = response.statusText;
                            supportId = response.getResponseHeader( SUPPORT_ID );

                            redirectUrl = response.getResponseHeader( APP_RESET_HEADER );

                            // BLUEJS-2469 && BLUEJS-2474
                            logger[ status === 401 || status === 0 ? 'warn' : 'error' ]( '[' + serviceContext.getStack() + ']',  'service request failed', settings.url, status, statusText, supportId ? 'SupportId: ' + supportId : '' );

                            // do we still want to broadcast 401s?
                            if( !disableDefaultError || redirectUrl || isHighPriorityResponse( response ) ){
                                if( !response.status || response.status < 300 || response.status > 399 || redirectUrl ){
                                    sendErrorMessage( serviceContext, settings, response, status );
                                }
                            }
                        } else {
                            logger.error( '[' + serviceContext.getStack() + ']', 'service response error', response );

                            if( !disableDefaultError ){
                                sendErrorMessage( serviceContext, settings, response );
                            }
                        }

                        // BLUEJS-2125 - changing the app-reset-code from 303 to 205, should handle both old and new to be safe
                        if( !redirectUrl ){
                            reject( response );
                        }
                    }
                    
                } ).catch( function( error ){
                    logger.error( '[' + serviceContext.getStack() + ']', 'service request catch error', error );
                    reject( error );
                } );
            } );
        }
    };
} );
