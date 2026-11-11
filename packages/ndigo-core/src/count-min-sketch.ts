/**
 * A Count-Min sketch: sub-linear-memory approximate frequency counting.
 * `estimate()` never undercounts and overcounts with bounded error.
 */
import { Serializable } from './serializable.js';
import { Equatable } from './equatable.js';

/**
 * The JSON form of a {@link CountMinSketch}: its dimensions, counter table,
 * and total observed count.
 */
export type CountMinSketchJSON = {
    /** Number of hash rows. */
    depth: number;
    /** Number of counters per row. */
    width: number;
    /** One row of counters per hash function. */
    table: number[][];
    /** Total count added across every value. */
    total: number;
};

function hash32(input: string, seed: number): number {
    let h = seed >>> 0;
    for (let i = 0; i < input.length; i++) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 0x5bd1e995);
        h ^= h >>> 15;
    }
    return h >>> 0;
}

function toKey(value: unknown): string {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean' || value === null) return String(value);
    try {
        return JSON.stringify(value) ?? String(value);
    } catch {
        return String(value);
    }
}

export class CountMinSketch implements Serializable, Equatable<CountMinSketch> {
    #depth: number;
    #width: number;
    #table: Uint32Array[];
    #total: number = 0;

    get [Symbol.toStringTag](): string {
        return 'CountMinSketch';
    }

    /**
     * Number of hash rows.
     */
    get depth(): number {
        return this.#depth;
    }

    /**
     * Number of counters per row.
     */
    get width(): number {
        return this.#width;
    }

    constructor(depth: number = 5, width: number = 1024) {
        this.#depth = Math.max(1, Math.floor(depth));
        this.#width = Math.max(1, Math.floor(width));
        this.#table = Array.from({ length: this.#depth }, () => new Uint32Array(this.#width));
    }

    /**
     * Sizes a sketch for a target error bound.
     *
     * @param expectedItems - Expected distinct values (used for the width bound).
     * @param falsePositiveRate - Target error rate in `(0, 1)`.
     * @returns A sketch with the derived dimensions.
     */
    static withTargetError(expectedItems: number, falsePositiveRate: number): CountMinSketch {
        // epsilon = 2/width, delta = 1/2^depth approximations
        const width = Math.max(1, Math.ceil(2 / falsePositiveRate));
        const depth = Math.max(1, Math.ceil(Math.log(1 / falsePositiveRate) / Math.log(2)));
        return new CountMinSketch(depth, width);
    }

    /**
     * Restores a sketch from its {@link CountMinSketchJSON} form.
     *
     * @param json - The serialized state, as produced by {@link CountMinSketch.toJSON}.
     * @returns A new sketch with the restored dimensions, counters, and total.
     */
    static fromJSON(json: CountMinSketchJSON): CountMinSketch {
        const sketch = new CountMinSketch(json.depth, json.width);
        for (let row = 0; row < sketch.#depth; row++) {
            const source = json.table[row] ?? [];
            for (let column = 0; column < sketch.#width; column++) {
                sketch.#table[row][column] = source[column] >>> 0;
            }
        }
        sketch.#total = json.total;
        return sketch;
    }

    /**
     * Records occurrences of a value.
     *
     * @param value - The value to count; hashed through its string form.
     * @param count - How many occurrences to add; defaults to one.
     * @returns This sketch, for chaining.
     */
    add(value: unknown, count: number = 1): this {
        const key = toKey(value);
        const c = Math.max(0, Math.floor(count));
        for (let d = 0; d < this.#depth; d++) {
            const idx = hash32(key, d * 0x9e3779b9 + 1) % this.#width;
            this.#table[d][idx] += c;
        }
        this.#total += c;
        return this;
    }

    /**
     * Estimates occurrences of a value.
     *
     * @param value - The value to estimate.
     * @returns A count that never undercounts and overcounts within the bound.
     */
    estimate(value: unknown): number {
        const key = toKey(value);
        let min = Infinity;
        for (let d = 0; d < this.#depth; d++) {
            const idx = hash32(key, d * 0x9e3779b9 + 1) % this.#width;
            if (this.#table[d][idx] < min) min = this.#table[d][idx];
        }
        return min === Infinity ? 0 : min;
    }

    /**
     * Total count added across every value.
     */
    get total(): number {
        return this.#total;
    }

    /**
     * Resets every counter and the total.
     */
    clear(): void {
        for (const row of this.#table) row.fill(0);
        this.#total = 0;
    }

    /**
     * Returns the JSON form.
     *
     * @returns The dimensions, counter table, and total.
     */
    toJSON(): CountMinSketchJSON {
        return {
            depth: this.#depth,
            width: this.#width,
            table: this.#table.map((row) => Array.from(row)),
            total: this.#total,
        };
    }

    /**
     * Summarizes the sketch.
     *
     * @returns The dimensions and total count.
     */
    toString(): string {
        return `CountMinSketch(depth=${this.#depth}, width=${this.#width}, total=${this.#total})`;
    }

    /**
     * Compares the full serialized state.
     *
     * @param value - The candidate to compare against.
     * @returns `true` when dimensions, counters, and total match.
     */
    equals(value: unknown): boolean {
        if (!(value instanceof CountMinSketch)) return false;
        return JSON.stringify(value.toJSON()) === JSON.stringify(this.toJSON());
    }
}
