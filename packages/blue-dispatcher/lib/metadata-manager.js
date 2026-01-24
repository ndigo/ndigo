/**
 * @author David Ensinger
 * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
 */
import 'reflect-metadata';
import { MultiValueMap } from '@blue/core';
const { defineProperty, getMetadata, getMetadataKeys } = Reflect;
/**
 * ! Changing the "private" properties to truly private, i.e. prepending #, breaks the unit tests - JBR
 */
/**
 * Create a new MetadataScanner for a given target.
 * @class module:dispatcher.MetadataScanner
 * @classdesc Scan an object for metadata defined on the object’s values and cache the resulting property names for subsequent scans.
 * @param {external:Record} target
 */
export class MetadataScanner {
    _cache;
    _target;
    constructor(target) {
        this._cache = new MultiValueMap();
        /**
         * @private
         * @member {external:Record} module:dispatcher.MetadataScanner#_target
         */
        defineProperty(this, '_target', {
            value: target,
            configurable: false,
            enumerable: false,
            writable: false,
        });
    }
    /**
     * @private
     * @function module:dispatcher.MetadataScanner#_primeCache
     * @param {external:string} metadataKey
     * @returns {external:Array<external:string>} The property names on the target that have metadata.
     */
    _primeCache(metadataKey) {
        const target = this._target;
        const cache = this._cache;
        const targetProps = Object.keys(target);
        for (let i = 0; i < targetProps.length; i++) {
            const prop = targetProps[i];
            const metadataKeys = getMetadataKeys(target, prop);
            for (let j = 0; j < metadataKeys.length; j++) {
                const key = metadataKeys[j];
                if (typeof getMetadata(key, target, prop) !== 'undefined') {
                    cache.add(key, prop);
                }
            }
        }
        return cache.get(metadataKey);
    }
    /**
     * Get the property names of the target object that have the requested metadata.
     * @function module:dispatcher.MetadataScanner#get
     * @param {external:string} metadataKey
     * @returns {external:Array<external:string>} The property names on the target that have metadata.
     */
    get(metadataKey) {
        const cache = this._cache;
        if (Boolean(cache.size)) {
            if (cache.has(metadataKey)) {
                return cache.get(metadataKey);
            }
            cache.clear();
        }
        return this._primeCache(metadataKey);
    }
    /**
     * Clear the metadata cache for the target object.
     * @function module:dispatcher.MetadataScanner#clear
     */
    clear() {
        this._cache.clear();
    }
}
/**
 * Create a WeakMap to store instances of Metadata Scanners
 * @class module:dispatcher.MetadataManager
 * @classdesc Store Metadata Scanners for performant retrieval across an entire application
 */
class MetadataManager {
    _scannerMap;
    constructor() {
        this._scannerMap = new WeakMap();
    }
    /**
     * Get the property names of the target object that have the requested metadata.
     * Look first for a metadataScanner instance for the target object in the scanner map.
     * If an instance is not found then make one, add that to the scanner map, and return
     * the properties with the requested metadata.
     * @function module:dispatcher.MetadataManager#get
     * @param {external:Record} target
     * @param {string} metadataKey
     * @returns {external:Array<external:string>} The property names on the target that have metadata.
     */
    get(target, metadataKey) {
        const scannerMap = this._scannerMap;
        if (scannerMap.has(target)) {
            const scanner = scannerMap.get(target);
            return scanner.get(metadataKey);
        }
        const targetScanner = new MetadataScanner(target);
        scannerMap.set(target, targetScanner);
        return targetScanner.get(metadataKey);
    }
}
export default new MetadataManager();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEtbWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tZXRhZGF0YS1tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sa0JBQWtCLENBQUM7QUFDMUIsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUUzQyxNQUFNLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxlQUFlLEVBQUUsR0FBRyxPQUFPLENBQUM7QUFFakU7O0dBRUc7QUFFSDs7Ozs7R0FLRztBQUNILE1BQU0sT0FBTyxlQUFlO0lBQ3hCLE1BQU0sQ0FBZ0M7SUFDdEMsT0FBTyxDQUFzQjtJQUU3QixZQUFZLE1BQTJCO1FBQ25DLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztRQUVsQzs7O1dBR0c7UUFDSCxjQUFjLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRTtZQUM1QixLQUFLLEVBQUUsTUFBTTtZQUNiLFlBQVksRUFBRSxLQUFLO1lBQ25CLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNLLFdBQVcsQ0FBQyxXQUFtQjtRQUNuQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzVCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDMUIsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzFDLE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixNQUFNLFlBQVksR0FBRyxlQUFlLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ25ELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQzNDLE1BQU0sR0FBRyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxPQUFPLFdBQVcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLFdBQVcsRUFBRSxDQUFDO29CQUN4RCxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDekIsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO1FBQ0QsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEdBQUcsQ0FBQyxXQUFtQjtRQUNuQixNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBRTFCLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1lBQ3RCLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDO2dCQUN6QixPQUFPLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDbEMsQ0FBQztZQUNELEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNsQixDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxLQUFLO1FBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN4QixDQUFDO0NBQ0o7QUFFRDs7OztHQUlHO0FBQ0gsTUFBTSxlQUFlO0lBQ2pCLFdBQVcsQ0FBZ0Q7SUFFM0Q7UUFDSSxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7SUFDckMsQ0FBQztJQUVEOzs7Ozs7Ozs7T0FTRztJQUNILEdBQUcsQ0FBQyxNQUEyQixFQUFFLFdBQW1CO1FBQ2hELE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDcEMsSUFBSSxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7WUFDekIsTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN2QyxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDcEMsQ0FBQztRQUNELE1BQU0sYUFBYSxHQUFHLElBQUksZUFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2xELFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3RDLE9BQU8sYUFBYSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMxQyxDQUFDO0NBQ0o7QUFFRCxlQUFlLElBQUksZUFBZSxFQUFFLENBQUMifQ==