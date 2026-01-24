/**
 * @author Jeff Rose
 */

import fill from './fill';

let module: Promise<any>;

fill('crypto_subtle', () => (module = import('webcrypto-shim')));

export default module || Promise.resolve();
