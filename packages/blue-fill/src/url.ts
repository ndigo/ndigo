/**
 * @author Jeff Rose
 */

import fill from './fill';

const modules: Promise<any>[] = [];

fill('url', () => modules.push(import('core-js/actual/url')));
fill('urlsearchparams', () => modules.push(import('core-js/actual/url-search-params')));

export default modules.length ? Promise.all(modules) : Promise.resolve();
