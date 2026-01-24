/**
 * Service API implementation.
 *
 * @author Jeff Rose, Aaron Brown
 * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
 */
define( function( require ){
    'use strict';

    var APP_RESET_HEADER = 'Alt-Location',

        ajax = require( 'blue/fetch' ),
        perf = require( 'blue/perf' ),
        uid  = 0,

        // xmlhttprequest api shim
        getResponseHeader = function( name ){
            return this.headers.get( name );
        },

        getAllResponseHeaders = function(){
            var headers = [];
            this.headers.forEach( function( value, name ){
                headers.push( name + ':' + value );
            } );
            return headers.length ? headers.join( '\r\n' ) : null;
        };

    /**
	 * Asynchronous http request function.
	 * @function module:blue/http#request
	 * @param {external:string} url URL for request (Optional: URL can be specified in options instead)
	 * @param {Object} settings Settings for http request.
	 * @return {Promise} Promise which will resolve to resolution of response data
	 */
    function request( url, options ){
        var done = perf.count.call( { bucket: 'service' }, 'blue/http', url.url || url ),
            p = ajax( url, options );
        // resolve perf logging
        p.then( done ).catch( done );
        // return request promise
        return p.then( function( response ){
            // check for server forced redirect
            if( response.headers.get( APP_RESET_HEADER ) ){ throw  response; }
            // success
            return response.data;
        } ).catch( function( error ){
            // apply xmlhttprequest api shims
            error.responseText = error.data;
            error.getResponseHeader = getResponseHeader;
            error.getAllResponseHeaders = getAllResponseHeaders;
            throw  error;
        } );
    }

    function cache( url ){
        return new Promise( function( resolve, reject ){
            try {
                var req = new XMLHttpRequest(),
                    readystatechange = function(){
                        // wait for loaded
                        if( req.readyState !== 4 ){ return; }
                        // not success
                        if( req.status !== 200 ){ return reject( req.statusText ); }
                        resolve();
                    };
                req.open( request.method || 'get', url, true );
                req.onreadystatechange = readystatechange;
                // Wrapping xhr.send within a setTimeout solves an unusual cache issue in Safari browsers.
                setTimeout( function(){
                    try {
                        req.send( request.body );
                    } catch ( ex ){
                        reject();
                    }
                }, 0 );
            } catch ( ex ){
                // ajax error
                reject();
            }
        } );
    }

    function append( url, type ){
        return new Promise( function( resolve, reject ){
            var el, int,
                target = document.getElementsByTagName( 'head' )[ 0 ],
                done = function( method ){
                    return function( result ){
                        clearInterval( int );
                        method( result );
                    };
                },
                success = done( resolve ),
                failure = done( reject );
            switch( type ){
                case 'css':
                    el = document.createElement( 'link' );
                    el.rel = 'stylesheet';
                    el.href = url;
                    // alternate way to ensure stylesheet load has been detected
                    int = setInterval( function(){
                        if(
                            Array.prototype.reduce.call(
                                document.styleSheets || [],
                                function( found, value ){ return found || value.href === url; },
                                false
                            )
                        ){
                            // call success since we can't reliably tell
                            // if the css loaded successfully or not
                            // el.sheet.cssRules is always null in chrome for cors css
                            success();
                        }
                    }, 100 );
                    break;
                case 'js':
                    el = document.createElement( 'script' );
                    el.src = url;
                    break;
                default:
                    return failure( 'unsupported resource type: ' + type );
            }
            // attach callback to events
            el.id = type + uid++;
            el.onload = success;
            el.onerror = failure;
            // Add element to container
            target.appendChild( el );
        } );
    }

    return {
        request: request,
        cache: cache,
        append: append
    };
} );
