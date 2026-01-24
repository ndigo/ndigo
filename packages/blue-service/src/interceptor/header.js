/**
 * @author Mark Saunders
 * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
 * @classdesc
 * Set a Session header value on a service, for testing purposes, not for production
 *
 * To Use, set the 'servicesettings' store and 'serviceheader' key
 *
 * Once set, utilized for all future service calls.
 * To unset, clear session value.
 *
 * @example
 * this.init = function init(){
 *   var sessionStore = new ( require( 'store/enumerable/session' ) )( 'servicesettings' ),
 * 		 sessionStore.set( 'serviceheader', 'headervalue' );
 * }
 */
define( function( require ){
    'use strict';
    var sessionStore = new ( require( 'blue/store/enumerable/session' ) )( 'servicesettings' );

    return {
        before: function headerInterceptor( settings ){
            // var	intercepted = this;
            // {} is jquery ajax default
            settings.header = sessionStore.get( 'serviceheader' ) || {};
            return settings;
        }
    };
} );
