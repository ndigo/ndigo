/**
 * @author Jeff Rose
 */

import has from '@blue/has';
import fill from './fill';

const modules: Promise<any>[] = [];

if (has.xmlhttprequest) {
    fill('fetch', () => modules.push(import('whatwg-fetch')));
}

if (has.fetch) {
    fill('abort_api', () => modules.push(import('abort-controller')));
}

export default modules.length ? Promise.all(modules) : Promise.resolve();
