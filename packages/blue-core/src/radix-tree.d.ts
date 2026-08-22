/**
 * @author Jeff Rose
 */
import { JSONValue, Serializable } from './serializable.js';
/**
 * Result of a successful radix tree path lookup.
 */
export interface RadixMatch<V> {
    /** The value stored at the matched node. */
    readonly value: V;
    /** Named parameters extracted from the path, or `null` when none were captured. */
    readonly params: Record<string, string> | null;
    /** The original pattern string that was matched. */
    readonly pattern: string;
}
/**
 * A radix tree implementation for URL routing.
 */
export declare class RadixTree<V> implements Serializable {
    #private;
    /**
     * The string tag for this class.
     */
    get [Symbol.toStringTag](): string;
    constructor();
    /**
     * Splits a path into segments using single-pass manual scan, removing leading slash and filtering empty strings.
     *
     * @param path - The path to split.
     * @returns An array of path segments.
     */
    private _splitPath;
    /**
     * Inserts a pattern and its associated value into the radix tree.
     *
     * @param pattern - The pattern to insert.
     * @param value - The value associated with the pattern.
     */
    insert(pattern: string, value: V): void;
    /**
     * Classifies a segment into one of the three node kinds.
     *
     * @param segment - The segment to classify.
     * @returns The kind of node this segment represents.
     */
    private _classifySegment;
    /**
     * Extracts the parameter name from a param segment (`:name` or `{name}`).
     *
     * @param segment - The param segment string.
     * @returns The extracted parameter label.
     */
    private _extractParamLabel;
    /**
     * Looks up a path in the radix tree and returns the matching value with parameters.
     *
     * @param path - The path to look up.
     * @returns A match object if found, otherwise null.
     */
    lookup(path: string): RadixMatch<V> | null;
    /**
     * Deletes a pattern from the radix tree.
     *
     * @param pattern - The pattern to delete.
     * @returns True if the pattern was found and deleted, false otherwise.
     */
    delete(pattern: string): boolean;
    /**
     * Serializes the radix tree to a JSON object.
     *
     * @returns A JSON object representation of the tree.
     */
    toJSON(): JSONValue;
}
