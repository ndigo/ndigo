/**
 * @author Jeff Rose
 */

import fill from './fill';

let module: Promise<any>;

fill( 'intl', () => module = import( 'intl' ) );

export default module || Promise.resolve();
