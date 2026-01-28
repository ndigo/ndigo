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
 * @classdesc Scan an object for metadata defined on the object’s values and cache the resulting property names for subsequent scans.
 * @param {Record} target
 */
export class MetadataScanner {
    _cache;
    _target;
    constructor(target) {
        this._cache = new MultiValueMap();
        /**
         * @private
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
     * @param {string} metadataKey
     * @returns {Array<external:string>} The property names on the target that have metadata.
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
     * @param {string} metadataKey
     * @returns {Array<external:string>} The property names on the target that have metadata.
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
     */
    clear() {
        this._cache.clear();
    }
}
/**
 * Create a WeakMap to store instances of Metadata Scanners
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
     * @param {Record} target
     * @param {string} metadataKey
     * @returns {Array<external:string>} The property names on the target that have metadata.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEtbWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tZXRhZGF0YS1tYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sa0JBQWtCLENBQUM7QUFDMUIsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUUzQyxNQUFNLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxlQUFlLEVBQUUsR0FBRyxPQUFPLENBQUM7QUFFakU7O0dBRUc7QUFFSDs7OztHQUlHO0FBQ0gsTUFBTSxPQUFPLGVBQWU7SUFDeEIsTUFBTSxDQUFnQztJQUN0QyxPQUFPLENBQXNCO0lBRTdCLFlBQVksTUFBMkI7UUFDbkMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDO1FBRWxDOztXQUVHO1FBQ0gsY0FBYyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDNUIsS0FBSyxFQUFFLE1BQU07WUFDYixZQUFZLEVBQUUsS0FBSztZQUNuQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLFdBQVcsQ0FBQyxXQUFtQjtRQUNuQyxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzVCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDMUIsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4QyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQzFDLE1BQU0sSUFBSSxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QixNQUFNLFlBQVksR0FBRyxlQUFlLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQ25ELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7Z0JBQzNDLE1BQU0sR0FBRyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUIsSUFBSSxPQUFPLFdBQVcsQ0FBQyxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxLQUFLLFdBQVcsRUFBRSxDQUFDO29CQUN4RCxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDekIsQ0FBQztZQUNMLENBQUM7UUFDTCxDQUFDO1FBQ0QsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsR0FBRyxDQUFDLFdBQW1CO1FBQ25CLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFFMUIsSUFBSSxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDdEIsSUFBSSxLQUFLLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUM7Z0JBQ3pCLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUNsQyxDQUFDO1lBQ0QsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2xCLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsS0FBSztRQUNELElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDeEIsQ0FBQztDQUNKO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxlQUFlO0lBQ2pCLFdBQVcsQ0FBZ0Q7SUFFM0Q7UUFDSSxJQUFJLENBQUMsV0FBVyxHQUFHLElBQUksT0FBTyxFQUFFLENBQUM7SUFDckMsQ0FBQztJQUVEOzs7Ozs7OztPQVFHO0lBQ0gsR0FBRyxDQUFDLE1BQTJCLEVBQUUsV0FBbUI7UUFDaEQsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUNwQyxJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUN6QixNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3ZDLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNwQyxDQUFDO1FBQ0QsTUFBTSxhQUFhLEdBQUcsSUFBSSxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbEQsVUFBVSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDdEMsT0FBTyxhQUFhLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzFDLENBQUM7Q0FDSjtBQUVELGVBQWUsSUFBSSxlQUFlLEVBQUUsQ0FBQyJ9