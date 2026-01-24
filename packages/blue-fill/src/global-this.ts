/**
 * @author Jeff Rose
 */

import fill from './fill';

let module: Promise<any>;

fill( 'globalthis', () => module = import( 'core-js/actual/global-this' ) );

export default module || Promise.resolve();
