/**
 * @author Jeff Rose
 */

import Fingerprint2 from '../node_modules/@fingerprintjs/fingerprintjs/fingerprint2.js';

type impression = boolean | number | string;

type Impression = { [key: string]: impression | impression[] };

export type Fingerprint = Impression[];

type IdleDeadline = {
    didTimeout: boolean;
    timeRemaining(): number;
};

type RequestIdleCallback = (callback: (deadline: IdleDeadline) => void) => unknown;

const scheduleIdle = (globalThis as unknown as { requestIdleCallback?: RequestIdleCallback }).requestIdleCallback
    ? (callback: (deadline: IdleDeadline) => void) =>
          (globalThis as unknown as { requestIdleCallback: RequestIdleCallback }).requestIdleCallback(callback)
    : (callback: (deadline: IdleDeadline) => void) =>
          setTimeout(() => callback({ didTimeout: false, timeRemaining: () => 0 }), 0);

/**
 * @typedef module:print.impression
 * @type {boolean|external:number|external:string}
 */

/**
 * @typedef module:print.Impression
 * @type {Object}
 * @property {string} key
 * @property {module:print.impression|external:Array<module:print.impression>} value
 */

/**
 * @typedef module:print.Fingerprint
 * @type {Array<module:print.Impression>}
 */

/**
 * A unique device signature
 */
export const fingerprint = new Promise<Fingerprint>(function (resolve, reject) {
    scheduleIdle(function () {
        try {
            Fingerprint2.get(resolve);
        } catch (e) {
            reject(e);
        }
    });
});

export default fingerprint;
