/**
 * @author Jeff Rose
 */

import fill from './fill';

const modules: Promise<any>[] = [];

fill('es9_promise', function () {
    fill('promise_finally', () => modules.push(import('core-js/actual/promise/finally')));
});

fill('es11_promise', function () {
    fill('promise_any', () => modules.push(import('core-js/actual/promise/any')));
    fill('promise_allsettled', () => modules.push(import('core-js/actual/promise/all-settled')));
});

export default modules.length ? Promise.all(modules) : Promise.resolve();
