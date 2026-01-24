/**
 * @author Jeff Rose
 * @module fill
 * @requires has
 */

import has from '@blue/has';
import fills from './fills';

const
    modules: Promise<any>[] = [
        import( './global-this' ).then( () => import( './encoding' ) ),
        import( './intl' ),
        import( './queue-microtask' ),
        import( './timers' ),
        import( './array' ),
        import( './collections' ),
        import( './math' ),
        import( './number' ),
        import( './object' ),
        import( './promise' ),
        import( './reflect' ),
        import( './regexp' ),
        import( './string' ),
        import( './symbol' )
    ];

if( has.window ){
    modules.push(
        import( './blob' ),
        import( './crypto' ),
        import( './navigator' ),
        import( './visual-viewport-segments' ),
        import( './url' ).then( () => import( './xhr' ) ).then( () => import( './fetch' ) )
    );
}

import '../node_modules/es-module-shims/dist/es-module-shims';

export default Promise.all( modules ).then( () => fills.sort() );

/**
 * A promise that tracks the loading of polyfills.
 * @const {external:Promise} module:fill.loading
 */
