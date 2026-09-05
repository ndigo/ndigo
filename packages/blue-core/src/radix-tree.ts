/**
 * @author Jeff Rose
 */

import { createNull } from './null.js';
import { JSONValue, Serializable } from './serializable.js';

type NodeKind = 'static' | 'param' | 'wildcard';

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

const { defineProperty } = Reflect;

class RadixNode<V> {
    declare kind: NodeKind;
    declare label: string;
    declare value: V | null;
    declare pattern: string | null;
    declare staticChildren: Map<string, RadixNode<V>>;
    declare paramChild: RadixNode<V> | null;
    declare wildcardChild: RadixNode<V> | null;

    constructor(kind: NodeKind, label: string) {
        defineProperty(this, 'kind', {
            value: kind,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        defineProperty(this, 'label', {
            value: label,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        defineProperty(this, 'value', {
            value: null,
            configurable: true,
            enumerable: false,
            writable: true,
        });

        defineProperty(this, 'pattern', {
            value: null,
            configurable: true,
            enumerable: false,
            writable: true,
        });

        defineProperty(this, 'staticChildren', {
            value: new Map<string, RadixNode<V>>(),
            configurable: true,
            enumerable: false,
            writable: false,
        });

        defineProperty(this, 'paramChild', {
            value: null,
            configurable: true,
            enumerable: false,
            writable: true,
        });

        defineProperty(this, 'wildcardChild', {
            value: null,
            configurable: true,
            enumerable: false,
            writable: true,
        });
    }
}

/**
 * A radix tree implementation for URL routing.
 */
export class RadixTree<V> implements Serializable {
    #root: RadixNode<V>;

    /**
     * The string tag for this class.
     */
    get [Symbol.toStringTag](): string {
        return 'RadixTree';
    }

    constructor() {
        this.#root = new RadixNode<V>('static', '');
    }

    /**
     * Splits a path into segments using single-pass manual scan, removing leading slash and filtering empty strings.
     *
     * @param path - The path to split.
     * @returns An array of path segments.
     */
    private _splitPath(path: string): string[] {
        const segments: string[] = [];
        let start = path.charCodeAt(0) === 47 /* '/' */ ? 1 : 0;
        const len = path.length;
        for (let i = start; i <= len; i++) {
            if (i === len || path.charCodeAt(i) === 47) {
                if (i > start) {
                    segments.push(path.slice(start, i));
                }
                start = i + 1;
            }
        }
        return segments;
    }

    /**
     * Inserts a pattern and its associated value into the radix tree.
     *
     * @param pattern - The pattern to insert.
     * @param value - The value associated with the pattern.
     */
    insert(pattern: string, value: V): void {
        const segments = this._splitPath(pattern);
        let node = this.#root;

        if (segments.length === 0) {
            // Special case for root pattern '/'
            node.value = value;
            node.pattern = pattern;
            return;
        }

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const kind = this._classifySegment(segment);

            switch (kind) {
                case 'static':
                    if (node.staticChildren.has(segment)) {
                        node = node.staticChildren.get(segment)!;
                    } else {
                        const child = new RadixNode<V>('static', segment);
                        node.staticChildren.set(segment, child);
                        node = child;
                    }
                    break;
                case 'param':
                    if (node.paramChild === null) {
                        node.paramChild = new RadixNode<V>('param', this._extractParamLabel(segment));
                    }
                    node = node.paramChild;
                    break;
                case 'wildcard':
                    if (node.wildcardChild === null) {
                        node.wildcardChild = new RadixNode<V>('wildcard', '*');
                    }
                    node = node.wildcardChild;
                    break;
            }
        }

        node.value = value;
        node.pattern = pattern;
    }

    /**
     * Classifies a segment into one of the three node kinds.
     *
     * @param segment - The segment to classify.
     * @returns The kind of node this segment represents.
     */
    private _classifySegment(segment: string): NodeKind {
        if (segment === '*') {
            return 'wildcard';
        } else if (segment.startsWith(':')) {
            return 'param';
        } else if (segment.startsWith('{') && segment.endsWith('}')) {
            return 'param';
        } else {
            return 'static';
        }
    }

    /**
     * Extracts the parameter name from a param segment (`:name` or `{name}`).
     *
     * @param segment - The param segment string.
     * @returns The extracted parameter label.
     */
    private _extractParamLabel(segment: string): string {
        if (segment.startsWith(':')) {
            return segment.slice(1);
        }
        // {name} syntax
        return segment.slice(1, -1);
    }

    /**
     * Looks up a path in the radix tree and returns the matching value with parameters.
     *
     * @param path - The path to look up.
     * @returns A match object if found, otherwise null.
     */
    lookup(path: string): RadixMatch<V> | null {
        let node = this.#root;
        let params: Record<string, string> | null = null;
        const len = path.length;
        let segStart = path.charCodeAt(0) === 47 ? 1 : 0;

        for (let i = segStart; i <= len; i++) {
            // Advance until slash or end
            if (i < len && path.charCodeAt(i) !== 47) {
                continue;
            }

            // Skip empty segments (leading slash, double slash)
            if (i === segStart) {
                segStart = i + 1;
                continue;
            }

            const segment = path.slice(segStart, i);
            segStart = i + 1;

            // Single Map probe: static > param > wildcard
            const staticMatch = node.staticChildren.get(segment);
            if (staticMatch !== undefined) {
                node = staticMatch;
                continue;
            }

            if (node.paramChild !== null) {
                if (params === null) {
                    params = {};
                }
                params[node.paramChild.label] = segment;
                node = node.paramChild;
                continue;
            }

            if (node.wildcardChild !== null) {
                node = node.wildcardChild;
                continue;
            }

            return null; // No match found
        }

        // All segments consumed — check if terminal
        if (node.value === null) {
            return null;
        }

        return {
            value: node.value,
            params,
            pattern: node.pattern!,
        };
    }

    /**
     * Deletes a pattern from the radix tree.
     *
     * @param pattern - The pattern to delete.
     * @returns True if the pattern was found and deleted, false otherwise.
     */
    delete(pattern: string): boolean {
        const segments = this._splitPath(pattern);
        let node = this.#root;

        if (segments.length === 0) {
            // Special case for root pattern '/'
            if (node.value !== null) {
                node.value = null;
                node.pattern = null;
                return true;
            }
            return false;
        }

        // Navigate to the terminal node
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const kind = this._classifySegment(segment);
            let child: RadixNode<V> | null;

            switch (kind) {
                case 'static':
                    child = node.staticChildren.get(segment) ?? null;
                    if (!child) {
                        return false;
                    }
                    node = child;
                    break;
                case 'param':
                    child = node.paramChild;
                    if (!child) {
                        return false;
                    }
                    node = child;
                    break;
                case 'wildcard':
                    child = node.wildcardChild;
                    if (!child) {
                        return false;
                    }
                    node = child;
                    break;
            }
        }

        // Check if the terminal node has a value
        if (node.value === null) {
            return false;
        }

        // Delete the pattern by clearing its value and pattern
        node.value = null;
        node.pattern = null;
        return true;
    }

    /**
     * Serializes the radix tree to a JSON object.
     *
     * @returns A JSON object representation of the tree.
     */
    toJSON(): JSONValue {
        let count = 0;

        const traverse = (node: RadixNode<V>) => {
            if (node.value !== null) {
                count++;
            }

            node.staticChildren.forEach((child) => traverse(child));
            if (node.paramChild) {
                traverse(node.paramChild);
            }
            if (node.wildcardChild) {
                traverse(node.wildcardChild);
            }
        };

        traverse(this.#root);

        const json = createNull();
        json.size = count;
        return json;
    }
}
