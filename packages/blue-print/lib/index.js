/**
 * @author Jeff Rose
 */
import Fingerprint2 from '../node_modules/@fingerprintjs/fingerprintjs/fingerprint2.js';
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
export const fingerprint = new Promise(function (resolve, reject) {
    // @ts-ignore: ¯\_(ツ)_/¯
    requestIdleCallback(function () {
        try {
            Fingerprint2.get(resolve);
        }
        catch (e) {
            reject(e);
        }
    });
});
export default fingerprint;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLFlBQVksTUFBTSw4REFBOEQsQ0FBQztBQVF4Rjs7O0dBR0c7QUFFSDs7Ozs7R0FLRztBQUVIOzs7R0FHRztBQUVIOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFHLElBQUksT0FBTyxDQUFjLFVBQVUsT0FBTyxFQUFFLE1BQU07SUFDekUsd0JBQXdCO0lBQ3hCLG1CQUFtQixDQUFDO1FBQ2hCLElBQUksQ0FBQztZQUNELFlBQVksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDOUIsQ0FBQztRQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7WUFDVCxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDZCxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQztBQUVILGVBQWUsV0FBVyxDQUFDIn0=