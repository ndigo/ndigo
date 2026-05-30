/**
 * @author Jeff Rose
 */

import { createNull } from './null';
import { JSONValue, Serializable } from './serializable';

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
 *
 * @implements module:core.Serializable
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
     * Splits a path into segments, removing leading slash and filtering empty strings.
     *
     * @param path - The path to split.
     * @returns An array of path segments.
     */
    private _splitPath(path: string): string[] {
        return path
            .replace(/^\//, '')
            .split('/')
            .filter(Boolean);
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
            let child: RadixNode<V> | null;

            switch (kind) {
                case 'static':
                    child = node.staticChildren.get(segment) || new RadixNode('static', segment);
                    if (!node.staticChildren.has(segment)) {
                        node.staticChildren.set(segment, child);
                    }
                    node = child;
                    break;
                case 'param':
                    child = node.paramChild || new RadixNode('param', this._extractParamLabel(segment));
                    if (!node.paramChild) {
                        node.paramChild = child;
                    }
                    node = child;
                    break;
                case 'wildcard':
                    child = node.wildcardChild || new RadixNode('wildcard', '*');
                    if (!node.wildcardChild) {
                        node.wildcardChild = child;
                    }
                    node = child;
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
        const segments = this._splitPath(path);
        let node = this.#root;
        const params: Record<string, string> = {};

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];

            // Priority: static > param > wildcard
            if (node.staticChildren.has(segment)) {
                node = node.staticChildren.get(segment)!;
                continue;
            }

            if (node.paramChild !== null) {
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
            params: Object.keys(params).length > 0 ? params : null,
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
                    child = node.staticChildren.get(segment);
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