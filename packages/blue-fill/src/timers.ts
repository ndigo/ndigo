/**
 * @author Jeff Rose
 */

import fill from './fill';

const modules: Promise<any>[] = [];

fill('clearimmediate', () => modules.push(import('core-js/actual/clear-immediate')));
fill('setimmediate', () => modules.push(import('core-js/actual/set-immediate')));
fill('setinterval', () => modules.push(import('core-js/actual/set-interval')));
fill('settimeout', () => modules.push(import('core-js/actual/set-timeout')));

export default modules.length ? Promise.all(modules) : Promise.resolve();
