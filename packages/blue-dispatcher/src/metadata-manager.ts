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
    _cache: MultiValueMap<string, string>;
    _target: Record<string, any>;

    constructor(target: Record<string, any>) {
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
    private _primeCache(metadataKey: string) {
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
    get(metadataKey: string) {
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
    clear(): void {
        this._cache.clear();
    }
}

/**
 * Create a WeakMap to store instances of Metadata Scanners
 * @class module:dispatcher.MetadataManager
 * @classdesc Store Metadata Scanners for performant retrieval across an entire application
 */
class MetadataManager {
    _scannerMap: WeakMap<Record<string, any>, MetadataScanner>;

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
    get(target: Record<string, any>, metadataKey: string) {
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
