/**
 * A probabilistic set membership filter: `has()` may return false positives
 * but never false negatives. Memory is O(bits) and independent of the
 * number of distinct values stored.
 */
import { Serializable } from './serializable.js';
import { Equatable } from './equatable.js';

/**
 * The JSON form of a {@link BloomFilter}: the bit width, hash count, packed
 * buckets, and insertion count.
 */
export type BloomFilterJSON = {
    /** Number of bits in the filter. */
    bits: number;
    /** Number of hash functions per value. */
    hashes: number;
    /** The packed bitset, one 32-bit word per entry. */
    buckets: number[];
    /** Number of values added. */
    count: number;
};

function fnv1a32(input: string): number {
    let hash = 0x811c9dc5;
    for (let i = 0; i < input.length; i++) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
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

export class BloomFilter implements Serializable, Equatable<BloomFilter> {
    #bits: number;
    #hashes: number;
    #buckets: Uint32Array;
    #count: number = 0;

    get [Symbol.toStringTag](): string {
        return 'BloomFilter';
    }

    get bitSize(): number {
        return this.#bits;
    }

    get hashCount(): number {
        return this.#hashes;
    }

    get size(): number {
        return this.#count;
    }

    constructor(bits: number, hashes: number) {
        if (!Number.isFinite(bits) || bits <= 0) throw new RangeError('bits must be a positive finite number');
        const m = Math.ceil(bits / 32) * 32;
        if (m > 0x100000000) throw new RangeError('bits exceeds maximum');
        this.#bits = m;
        this.#hashes = Math.max(1, Math.min(2048, Math.floor(hashes)));
        this.#buckets = new Uint32Array(m / 32);
    }

    static withTargetError(expectedItems: number, falsePositiveRate: number): BloomFilter {
        if (!Number.isFinite(expectedItems) || expectedItems <= 0)
            throw new RangeError('expectedItems must be positive');
        if (!Number.isFinite(falsePositiveRate) || falsePositiveRate <= 0 || falsePositiveRate >= 1)
            throw new RangeError('falsePositiveRate must be in (0,1)');
        const m = Math.ceil(-(expectedItems * Math.log(falsePositiveRate)) / Math.log(2) ** 2);
        const k = Math.max(1, Math.round((m / expectedItems) * Math.log(2)));
        return new BloomFilter(m, k);
    }

    static fromJSON(json: { bits: number; hashes: number; buckets: ArrayLike<number>; count?: number }): BloomFilter {
        const filter = new BloomFilter(json.bits, json.hashes);
        const src = json.buckets;
        for (let i = 0; i < filter.#buckets.length; i++) {
            filter.#buckets[i] = src[i] >>> 0;
        }
        filter.#count = json.count ?? 0;
        return filter;
    }

    #locations(value: unknown): number[] {
        const key = toKey(value);
        const h1 = fnv1a32(key);
        const h2 = (fnv1a32(key + '\u0000' + key.length) | 1) >>> 0; // odd step, unsigned
        const out: number[] = [];
        for (let i = 0; i < this.#hashes; i++) {
            out.push((h1 + i * h2) % this.#bits);
        }
        return out;
    }

    add(value: unknown): this {
        for (const loc of this.#locations(value)) {
            this.#buckets[loc >>> 5] |= 1 << (loc & 31);
        }
        this.#count++;
        return this;
    }

    has(value: unknown): boolean {
        for (const loc of this.#locations(value)) {
            if ((this.#buckets[loc >>> 5] & (1 << (loc & 31))) === 0) return false;
        }
        return true;
    }

    clear(): void {
        this.#buckets.fill(0);
        this.#count = 0;
    }

    toJSON(): BloomFilterJSON {
        return {
            bits: this.#bits,
            hashes: this.#hashes,
            buckets: Array.from(this.#buckets),
            count: this.#count,
        };
    }

    toString(): string {
        return `BloomFilter(bits=${this.#bits}, hashes=${this.#hashes}, size=${this.#count})`;
    }

    equals(value: unknown): boolean {
        if (!(value instanceof BloomFilter)) return false;
        return JSON.stringify(value.toJSON()) === JSON.stringify(this.toJSON());
    }
}
