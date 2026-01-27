/**
 * @author Jeff Rose
 */
type impression = boolean | number | string;
type Impression = {
    [key: string]: impression | impression[];
};
export type Fingerprint = Impression[];
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
export declare const fingerprint: Promise<Fingerprint>;
export default fingerprint;
//# sourceMappingURL=index.d.ts.map