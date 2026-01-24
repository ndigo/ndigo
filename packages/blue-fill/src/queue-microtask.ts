/**
 * @author Jeff Rose
 */

import fill from './fill';

let module: Promise<any>;

fill('queuemicrotask', function () {
    fill('queuemicrotask', () => (module = import('core-js/actual/queue-microtask')));
});

export default module || Promise.resolve();
