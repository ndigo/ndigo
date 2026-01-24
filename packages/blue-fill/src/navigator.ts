/**
 * @author Jeff Rose
 */

import has from '@blue/has';
import fill from './fill';

let module: Promise<any>;

if( has.navigator ){
    fill( 'navigator_sendbeacon', () => module = import( 'navigator.sendbeacon' ) );
}

export default module || Promise.resolve();
