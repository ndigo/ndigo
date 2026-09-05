/**
 */

import { MultiValueMap, getSymbolMetadata } from '@blue/core';

const { defineProperty } = Reflect;

/**
 * ! Changing the "private" properties to truly private, i.e. prepending #, breaks the unit tests - JBR
 */

/**
 * Create a new MetadataScanner for a given target.
 * Invoked via the `classdesc` decorator.
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
    /**
     * Cached metadata lookups for the current target.
     */
    _cache: MultiValueMap<string, string>;

    /**
     * Target object whose metadata is being scanned.
     */
    _target!: Record<string, any>;

    /**
     * Create a scanner for a target object.
     *
     * @param target - The object, prototype, or constructor to scan.
     */
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
    /**
     * Populate the cache from the target's metadata and return the matching entries.
     *
     * @param metadataKey - The metadata key to search for.
     * @returns The matching property names, or `undefined` when no metadata exists.
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
    /**
     * Get the property names that match a metadata key.
     *
     * @param metadataKey - The metadata key to query.
     * @returns The matching property names, or `undefined` when none are found.
     */
    get(metadataKey: string): string[] | undefined {
        const cache = this._cache;

        if (cache.size) {
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
    /**
     * Clear all cached metadata lookups for this scanner.
     */
    clear(): void {
        this._cache.clear();
    }
}

/**
 * Create a WeakMap to store instances of Metadata Scanners
 * Invoked via the `classdesc` decorator.
 */
class MetadataManager {
    /**
     * Weakly cached scanners keyed by target object.
     */
    _scannerMap: WeakMap<Record<string, any>, MetadataScanner>;

    /**
     * Create a metadata manager.
     */
    constructor() {
        this._scannerMap = new WeakMap();
    }

    /**
     * Get the property names of a target object that match the requested metadata key.
     *
     * @param target - The object, prototype, or constructor to scan.
     * @param metadataKey - The metadata key to query.
     * @returns The matching property names, or `undefined` when none are found.
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
