/**
 * @module ndigo-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { createNull } from './null.js';
import { JSONValue, Serializable } from './serializable.js';

type NodeKind = 'static' | 'param' | 'wildcard' | 'greedy';

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

/** A recorded greedy (`**` / `{*name}`) fallback: the child, the path offset it captures from, and the params captured above it. */
interface GreedyCandidate<V> {
    node: RadixNode<V>;
    restStart: number;
    params: Record<string, string> | null;
}

const { defineProperty } = Reflect;

class RadixNode<V> {
    declare kind: NodeKind;
    declare label: string;
    declare value: V | null;
    declare pattern: string | null;
    declare staticChildren: Map<string, RadixNode<V>>;
    declare paramChildren: Map<string, RadixNode<V>>;
    declare wildcardChild: RadixNode<V> | null;
    declare greedyChildren: Map<string, RadixNode<V>>;

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

        defineProperty(this, 'paramChildren', {
            value: new Map<string, RadixNode<V>>(),
            configurable: true,
            enumerable: false,
            writable: false,
        });

        defineProperty(this, 'wildcardChild', {
            value: null,
            configurable: true,
            enumerable: false,
            writable: true,
        });

        defineProperty(this, 'greedyChildren', {
            value: new Map<string, RadixNode<V>>(),
            configurable: true,
            enumerable: false,
            writable: false,
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
     * @param starts - Optional collector receiving each segment's start offset.
     * @returns An array of path segments.
     */
    private _splitPath(path: string, starts?: number[]): string[] {
        const segments: string[] = [];
        let start = path.charCodeAt(0) === 47 /* '/' */ ? 1 : 0;
        const len = path.length;
        for (let i = start; i <= len; i++) {
            if (i === len || path.charCodeAt(i) === 47) {
                if (i > start) {
                    segments.push(path.slice(start, i));
                    starts?.push(start);
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

        const length = segments.length;
        for (let i = 0; i < length; i++) {
            const segment = segments[i];
            const kind = this._classifySegment(segment);

            switch (kind) {
                case 'static': {
                    const existing = node.staticChildren.get(segment);
                    if (existing) {
                        node = existing;
                    } else {
                        const child = new RadixNode<V>('static', segment);
                        node.staticChildren.set(segment, child);
                        node = child;
                    }
                    break;
                }
                case 'param': {
                    const label = this._extractParamLabel(segment);
                    let child = node.paramChildren.get(label);
                    if (child === undefined) {
                        child = new RadixNode<V>('param', label);
                        node.paramChildren.set(label, child);
                    }
                    node = child;
                    break;
                }
                case 'wildcard':
                    if (node.wildcardChild === null) {
                        node.wildcardChild = new RadixNode<V>('wildcard', '*');
                    }
                    node = node.wildcardChild;
                    break;
                case 'greedy': {
                    const label = this._extractGreedyLabel(segment);
                    let child = node.greedyChildren.get(label);
                    if (child === undefined) {
                        child = new RadixNode<V>('greedy', label);
                        node.greedyChildren.set(label, child);
                    }
                    node = child;
                    if (i < segments.length - 1) {
                        throw new TypeError(
                            `Greedy segment "${segment}" must be the last segment of a path pattern, ` +
                                `got "${pattern}"`
                        );
                    }
                    break;
                }
            }
        }

        node.value = value;
        node.pattern = pattern;
    }

    /**
     * Classifies a segment into one of the four node kinds.
     *
     * @param segment - The segment to classify.
     * @returns The kind of node this segment represents.
     */
    private _classifySegment(segment: string): NodeKind {
        if (segment === '*' || segment === '**') {
            // `**` is the non-capturing greedy match (rest of the path);
            // `*` stays the single-segment wildcard.
            return segment === '**' ? 'greedy' : 'wildcard';
        } else if (segment.startsWith('{*') && segment.endsWith('}')) {
            // `{*name}` captures the rest of the path (zero or more segments).
            return 'greedy';
        } else if (segment.startsWith(':')) {
            return 'param';
        } else if (segment.startsWith('{') && segment.endsWith('}')) {
            return 'param';
        } else {
            return 'static';
        }
    }

    /**
     * Extracts the parameter label from a greedy segment (`{*name}` → `name`,
     * `**` → `''` — non-capturing).
     *
     * @param segment - The greedy segment string.
     * @returns The captured parameter label, or `''` for a bare `**`.
     */
    private _extractGreedyLabel(segment: string): string {
        return segment === '**' ? '' : segment.slice(2, -1);
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
     * Returns the greedy child to record as a backtracking fallback: the first
     * registered with a live value, else the first registered. Preferring a
     * live value keeps a deleted greedy registration (`**` vs `{*name}`) from
     * masking a surviving sibling on a deeper dead-end (KRN-REV-RADIX-01).
     */
    private _firstGreedy(node: RadixNode<V>): RadixNode<V> | null {
        let fallback: RadixNode<V> | null = null;
        for (const child of node.greedyChildren.values()) {
            if (child.value !== null) {
                return child;
            }
            fallback ??= child;
        }
        return fallback;
    }

    /**
     * Looks up a path in the radix tree and returns the matching value with parameters.
     *
     * Probe order per segment is static → param → single-segment wildcard →
     * greedy. A greedy child (`**` / `{*name}`, D-1) matches the *rest of the
     * path* (zero or more segments). Because a more specific branch may fail
     * deeper in the tree, the deepest greedy child passed on the way down is
     * remembered and used as a backtracking fallback.
     *
     * @param path - The path to look up.
     * @returns A match object if found, otherwise null.
     */
    lookup(path: string): RadixMatch<V> | null {
        const starts: number[] = [];
        const segments = this._splitPath(path, starts);
        return this._match(this.#root, path, segments, starts, 0, null, null);
    }

    /**
     * Recursive path walk. Each node tries its candidates in precedence order
     * (static → param → wildcard → greedy) and descends into the first one that
     * yields a match; distinct registrations at the same position (different
     * param labels, `**` vs `{*name}`) are independent siblings, so a failed
     * branch falls through to the next. `greedy` is the deepest greedy child
     * passed on the way down, used as a backtracking fallback once every
     * specific branch dead-ends — its params are a snapshot, so captures made
     * deeper in the tree never leak into the fallback match (COR-3).
     */
    private _match(
        node: RadixNode<V>,
        path: string,
        segments: string[],
        starts: number[],
        index: number,
        params: Record<string, string> | null,
        greedy: GreedyCandidate<V> | null
    ): RadixMatch<V> | null {
        const segmentStart = index < starts.length ? starts[index] : path.length;

        if (index === segments.length) {
            if (node.value !== null && node.pattern !== null) {
                return { value: node.value, params, pattern: node.pattern };
            }
            // A node's own zero-segment greedy (`/static/{*file}` vs `/static`)
            // takes precedence over any recorded fallback; once one is present
            // its result is final (matching the single-child semantics).
            let terminalGreedy = false;
            for (const greedyChild of node.greedyChildren.values()) {
                terminalGreedy = true;
                const match = this._takeGreedy(
                    { node: greedyChild, restStart: segmentStart, params: params === null ? null : { ...params } },
                    path
                );
                if (match !== null) {
                    return match;
                }
            }
            if (terminalGreedy) {
                return null;
            }
            return greedy === null ? null : this._takeGreedy(greedy, path);
        }

        const segment = segments[index];
        const firstGreedyChild = this._firstGreedy(node);
        const descendGreedy: GreedyCandidate<V> | null =
            firstGreedyChild === null
                ? greedy
                : { node: firstGreedyChild, restStart: segmentStart, params: params === null ? null : { ...params } };

        // Strict per-node kind precedence: the most specific kind present wins
        // and its result is final. Distinct registrations within a kind —
        // several param labels, or `**` alongside `{*name}` — are tried in
        // registration order until one yields a match.
        const staticChild = node.staticChildren.get(segment);
        if (staticChild !== undefined) {
            return this._match(staticChild, path, segments, starts, index + 1, params, descendGreedy);
        }

        if (node.paramChildren.size > 0) {
            for (const paramChild of node.paramChildren.values()) {
                const nextParams: Record<string, string> = params === null ? {} : { ...params };
                nextParams[paramChild.label] = segment;
                const match = this._match(paramChild, path, segments, starts, index + 1, nextParams, descendGreedy);
                if (match !== null) {
                    return match;
                }
            }
            return null;
        }

        if (node.wildcardChild !== null) {
            return this._match(node.wildcardChild, path, segments, starts, index + 1, params, descendGreedy);
        }

        // This node's own greedy children take precedence over the recorded
        // fallback; once one exists its (possibly null) result is final, so a
        // deleted greedy route does not silently defer to an ancestor's `**`.
        let ownGreedy = false;
        for (const greedyChild of node.greedyChildren.values()) {
            ownGreedy = true;
            const match = this._takeGreedy(
                { node: greedyChild, restStart: segmentStart, params: params === null ? null : { ...params } },
                path
            );
            if (match !== null) {
                return match;
            }
        }
        if (ownGreedy) {
            return null;
        }

        // No branch at this node — fall back to the deepest recorded greedy.
        return greedy === null ? null : this._takeGreedy(greedy, path);
    }

    /**
     * Builds a match from a greedy fallback candidate, capturing the rest of
     * the path into the candidate's label (`''` — a bare `**` — captures
     * nothing).
     */
    private _takeGreedy(candidate: GreedyCandidate<V>, path: string): RadixMatch<V> | null {
        let captured = candidate.params;
        const rest = path.slice(candidate.restStart).replace(/\/+$/, '');
        if (candidate.node.label !== '') {
            if (captured === null) {
                captured = {};
            }
            captured[candidate.node.label] = rest;
        }
        if (candidate.node.value === null || candidate.node.pattern === null) {
            return null;
        }
        return { value: candidate.node.value, params: captured, pattern: candidate.node.pattern };
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
            if (node.value !== null && node.pattern === pattern) {
                node.value = null;
                node.pattern = null;
                return true;
            }
            return false;
        }

        // Navigate to the terminal node
        const length = segments.length;
        for (let i = 0; i < length; i++) {
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
                    child = node.paramChildren.get(this._extractParamLabel(segment)) ?? null;
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
                case 'greedy':
                    child = node.greedyChildren.get(this._extractGreedyLabel(segment)) ?? null;
                    if (!child) {
                        return false;
                    }
                    node = child;
                    break;
            }
        }

        // Only clear the exact pattern registered at this node — distinct
        // patterns sharing a shape (e.g. `:id` vs `:name`) are independent
        // registrations, so a delete must not clear a different one.
        if (node.value === null || node.pattern !== pattern) {
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
            node.paramChildren.forEach((child) => traverse(child));
            if (node.wildcardChild) {
                traverse(node.wildcardChild);
            }
            node.greedyChildren.forEach((child) => traverse(child));
        };

        traverse(this.#root);

        const json = createNull();
        json.size = count;
        return json;
    }
}
