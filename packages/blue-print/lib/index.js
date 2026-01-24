/**
 * @author Jeff Rose
 * @module print
 */
import Fingerprint2 from '../node_modules/@fingerprintjs/fingerprintjs/fingerprint2.js';
/**
 * @typedef module:print.impression
 * @type {external:boolean|external:number|external:string}
 */
/**
 * @typedef module:print.Impression
 * @type {external:Object}
 * @property {external:string} key
 * @property {module:print.impression|external:Array<module:print.impression>} value
 */
/**
 * @typedef module:print.Fingerprint
 * @type {external:Array<module:print.Impression>}
 */
/**
 * A unique device signature
 * @const {external:Promise<module:print.Fingerprint[]>} module:print.fingerprint
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxZQUFZLE1BQU0sOERBQThELENBQUM7QUFReEY7OztHQUdHO0FBRUg7Ozs7O0dBS0c7QUFFSDs7O0dBR0c7QUFFSDs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxXQUFXLEdBQUcsSUFBSSxPQUFPLENBQWMsVUFBVSxPQUFPLEVBQUUsTUFBTTtJQUN6RSx3QkFBd0I7SUFDeEIsbUJBQW1CLENBQUM7UUFDaEIsSUFBSSxDQUFDO1lBQ0QsWUFBWSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM5QixDQUFDO1FBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztZQUNULE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNkLENBQUM7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDO0FBRUgsZUFBZSxXQUFXLENBQUMifQ==