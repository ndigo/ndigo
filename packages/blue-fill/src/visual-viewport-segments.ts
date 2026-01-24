/**
 * @author Jeff Rose
 */

import has from '@blue/has';
import fill from './fill';

let module: Promise<any>;

if( has.window && has.visualviewport ){
    fill( 'visualviewport_segments', () => module = Promise.all( [
         import( 'viewportsegments-polyfill' ),
         import( 'viewportsegments-css-polyfill' )
    ] ) );
}

export default module || Promise.resolve();
