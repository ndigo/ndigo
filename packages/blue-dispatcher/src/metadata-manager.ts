/**
 * @author David Ensinger
 * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
 */

import '@tsmetadata/polyfill';
import { MultiValueMap } from '@blue/core';

const { defineProperty } = Reflect;

/**
 * ! Changing the "private" properties to truly private, i.e. prepending #, breaks the unit tests - JBR
 */

/**
 * Helper to extract Symbol.metadata from a target (constructor or prototype)
 */
function getSymbolMetadata(target: any): Record<string, any> | null {
    // If target is a constructor function
    if (typeof target === 'function' && target[Symbol.metadata]) {
        return target[Symbol.metadata];
    }
    // If target is a prototype or instance
    if (target && target.constructor && target.constructor[Symbol.metadata]) {
        return target.constructor[Symbol.metadata];
    }
    return null;
}

/**
 * Create a new MetadataScanner for a given target.
 * @classdesc Scan a class or prototype for TC39 decorator metadata stored in Symbol.metadata and cache property names.
 *
 * **TC39 Decorator Migration Note:**
 * This class has been updated to work with TC39 Stage 3 decorators. It scans Symbol.metadata
 * on class constructors instead of using the legacy Reflect.getMetadata API.
 *
 * Metadata keys are expected to follow patterns like:
 * - `route:mapping` (class-level)
 * - `route:mapping:methodName` (method-level)
 * - `method:parameter:methodName` (method parameter info)
 *
 * @param {Record} target - Class constructor, prototype, or instance
 */
export class MetadataScanner {
    _cache: MultiValueMap<string, string>;
    _target: Record<string, any>;

    constructor(target: Record<string, any> = {}) {
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
     * @param {string} metadataKey - The metadata key to search for (e.g., 'route:mapping')
     * @returns {Array<external:string>} The property names that have metadata matching the key pattern.
     */
    private _primeCache(metadataKey: string): string[] | undefined {
        const target = this._target;
        const cache = this._cache;
        const symbolMetadata = getSymbolMetadata(target);

        if (!symbolMetadata) {
            return undefined;
        }

        // Scan ALL metadata keys in Symbol.metadata and cache them all at once
        // This matches the legacy behavior where the cache is primed with all metadata
        const allMetadataKeys = Object.keys(symbolMetadata);

        // Group metadata keys by their base pattern
        // We need to identify which keys are "base" keys (class-level) vs "extended" keys (method-level)
        // Strategy: A key is method-level if there exists another key that is a prefix of it
        const baseKeys = new Set<string>();
        const methodKeys = new Map<string, string[]>(); // baseKey -> [propertyName, ...]

        // First pass: identify all unique base keys
        for (let i = 0; i < allMetadataKeys.length; i++) {
            const fullKey = allMetadataKeys[i];
            const metadataValue = symbolMetadata[fullKey];

            if (typeof metadataValue === 'undefined') {
                continue;
            }

            // Check if this key is a class-level key (no property suffix)
            // by seeing if other keys start with this key + ':'
            let isClassLevel = false;
            for (let j = 0; j < allMetadataKeys.length; j++) {
                if (i !== j && allMetadataKeys[j].startsWith(`${fullKey}:`)) {
                    isClassLevel = true;
                    baseKeys.add(fullKey);
                    break;
                }
            }

            if (!isClassLevel) {
                // This might be a method-level key, check if it has a base
                const lastColonIndex = fullKey.lastIndexOf(':');
                if (lastColonIndex !== -1) {
                    const potentialBase = fullKey.substring(0, lastColonIndex);
                    const propertyName = fullKey.substring(lastColonIndex + 1);

                    // Add to method keys
                    if (!methodKeys.has(potentialBase)) {
                        methodKeys.set(potentialBase, []);
                    }
                    methodKeys.get(potentialBase)!.push(propertyName);
                } else {
                    // No colon: standalone class-level key
                    cache.add(fullKey, '');
                }
            }
        }

        // Second pass: add base keys and method keys to cache
        baseKeys.forEach((baseKey) => {
            cache.add(baseKey, ''); // Class-level entry
        });

        methodKeys.forEach((propertyNames, baseKey) => {
            propertyNames.forEach((propName) => {
                cache.add(baseKey, propName);
            });
        });

        return cache.get(metadataKey);
    }

    /**
     * Get the property names of the target object that have the requested metadata.
     * @param {string} metadataKey - The metadata key pattern (e.g., 'route:mapping')
     * @returns {Array<external:string>} The property names that have metadata, or undefined if none found.
     */
    get(metadataKey: string): string[] | undefined {
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
    clear(): void {
        this._cache.clear();
    }
}

/**
 * Create a WeakMap to store instances of Metadata Scanners
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
     * @param {Record} target
     * @param {string} metadataKey
     * @returns {Array<external:string>} The property names on the target that have metadata.
     */
    get(target: Record<string, any>, metadataKey: string): string[] | undefined {
        const scannerMap = this._scannerMap;
        if (scannerMap.has(target)) {
            const scanner = scannerMap.get(target);
            return scanner!.get(metadataKey);
        }
        const targetScanner = new MetadataScanner(target);
        scannerMap.set(target, targetScanner);
        return targetScanner.get(metadataKey);
    }
}

export default new MetadataManager();
