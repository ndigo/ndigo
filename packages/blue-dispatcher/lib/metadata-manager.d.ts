/**
 * @author David Ensinger
 * @copyright &copy; JPMorgan Chase & Co. All rights reserved.
 */
import 'reflect-metadata';
import { MultiValueMap } from '@blue/core';
/**
 * ! Changing the "private" properties to truly private, i.e. prepending #, breaks the unit tests - JBR
 */
/**
 * Create a new MetadataScanner for a given target.
 * @classdesc Scan an object for metadata defined on the object’s values and cache the resulting property names for subsequent scans.
 * @param {Record} target
 */
export declare class MetadataScanner {
    _cache: MultiValueMap<string, string>;
    _target: Record<string, any>;
    constructor(target: Record<string, any>);
    /**
     * @private
     * @param {string} metadataKey
     * @returns {Array<external:string>} The property names on the target that have metadata.
     */
    private _primeCache;
    /**
     * Get the property names of the target object that have the requested metadata.
     * @param {string} metadataKey
     * @returns {Array<external:string>} The property names on the target that have metadata.
     */
    get(metadataKey: string): string[];
    /**
     * Clear the metadata cache for the target object.
     */
    clear(): void;
}
/**
 * Create a WeakMap to store instances of Metadata Scanners
 * @classdesc Store Metadata Scanners for performant retrieval across an entire application
 */
declare class MetadataManager {
    _scannerMap: WeakMap<Record<string, any>, MetadataScanner>;
    constructor();
    /**
     * Get the property names of the target object that have the requested metadata.
     * Look first for a metadataScanner instance for the target object in the scanner map.
     * If an instance is not found then make one, add that to the scanner map, and return
     * the properties with the requested metadata.
     * @param {Record} target
     * @param {string} metadataKey
     * @returns {Array<external:string>} The property names on the target that have metadata.
     */
    get(target: Record<string, any>, metadataKey: string): string[];
}
declare const _default: MetadataManager;
export default _default;
//# sourceMappingURL=metadata-manager.d.ts.map