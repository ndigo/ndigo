/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { isEntries, isJSONObject, JSONValue, Serializable } from '@ndigo/core';
import { is } from '@ndigo/util/types';

const { defineProperty, deleteProperty, get, set } = Reflect,
    isHeaders = is(Headers) as (value: unknown) => value is Headers,
    isRecord = isJSONObject as (value: unknown) => value is HeaderRecord;

type HeaderEntries = Array<[string, string]>;

/** Node `IncomingMessage`-style header record (lower-cased name → value or lines). */
export type HeaderRecord = Record<string, string | string[] | undefined>;

/**
 * Folds a header name to the lower-cased spelling used by Node server
 * header records (DSG-5).
 *
 * This is the package's single folding rule: `Headers` folds
 * case-insensitively itself, while plain records are written lower-cased by
 * the Node server — so every exact-match read retries with this folded
 * spelling. Shared with `@ndigo/test`'s response mock (HG-10) so the captured
 * map and the readers can never drift.
 *
 * @param name - The header name to fold.
 * @returns The lower-cased name.
 */
export function foldHeaderName(name: string): string {
    return name.toLowerCase();
}

function deletePair(entries: HeaderEntries, name: string): void {
    const length = entries.length;

    if (length) {
        for (let index = 0; index < length; index++) {
            if (entries[index] && entries[index][0] === name) {
                deleteProperty(entries, index);
                return;
            }
        }

        // Case-folded retry (DSG-5): Node-server header tuples are
        // lower-cased, so a canonical extractor name must still match.
        const folded = foldHeaderName(name);

        if (folded !== name) {
            for (let index = 0; index < length; index++) {
                if (entries[index] && entries[index][0] === folded) {
                    deleteProperty(entries, index);
                    return;
                }
            }
        }
    }
}

function getPair(entries: HeaderEntries, name: string): string | null {
    const length = entries.length;

    if (length) {
        for (let index = 0; index < length; index++) {
            if (entries[index][0] === name) {
                return entries[index][1];
            }
        }

        // Case-folded retry (DSG-5): Node-server header tuples are
        // lower-cased, so a canonical extractor name must still match.
        const folded = foldHeaderName(name);

        if (folded !== name) {
            for (let index = 0; index < length; index++) {
                if (entries[index][0] === folded) {
                    return entries[index][1];
                }
            }
        }
    }

    return null;
}

function setPair(entries: HeaderEntries, name: string, value: string): void {
    const length = entries.length;

    if (length) {
        for (let index = 0; index < length; index++) {
            if (entries[index] && entries[index][0] === name) {
                entries[index][1] = value;
                return;
            }
        }

        // Case-folded retry (DSG-5): update the lower-cased tuple in place
        // instead of pushing a second, canonically-cased entry.
        const folded = foldHeaderName(name);

        if (folded !== name) {
            for (let index = 0; index < length; index++) {
                if (entries[index] && entries[index][0] === folded) {
                    entries[index][1] = value;
                    return;
                }
            }
        }
    }

    entries.push([name, value]);
}

function deleteHeader(headers: HeadersInit | HeaderRecord, name: string): void {
    if (isHeaders(headers)) {
        (headers as Headers).delete(name);
    } else if (isEntries(headers)) {
        // isEntries narrows to the core Entry shape; the pair helpers only read [name, value] tuples.
        deletePair(headers as unknown as HeaderEntries, name);
    } else if (isRecord(headers)) {
        const record = headers;
        // Node-server records are lower-cased; remove both this name and its
        // folded form so the header is gone for every read spelling.
        deleteProperty(record, name);
        const folded = foldHeaderName(name);
        if (folded !== name) {
            deleteProperty(record, folded);
        }
    }
}

/**
 * Reads a header value without folding multi-value (`string[]`) entries.
 *
 * @param headers - The header collection to read from.
 * @param name - The header name to read.
 * @returns The raw value (joined arrays preserved), or `null` when absent.
 */
function getHeaderValue(headers: HeadersInit | HeaderRecord, name: string): string | string[] | null {
    if (isHeaders(headers)) {
        return (headers as Headers).get(name);
    } else if (isEntries(headers)) {
        return getPair(headers as unknown as HeaderEntries, name);
    } else if (isRecord(headers)) {
        const record = headers;
        let value = get(record, name);

        if (value === undefined) {
            // Case-folded retry (DSG-5): Node-server request/response headers
            // are lower-cased records, so a canonical extractor name must
            // still match.
            value = get(record, foldHeaderName(name));
        }

        return value === undefined ? null : value;
    }
    return null;
}

function getHeader(headers: HeadersInit | HeaderRecord, name: string): string | null {
    const value = getHeaderValue(headers, name);
    if (value === null) {
        return null;
    }
    // Array-valued entries (Node `set-cookie` records) count as present;
    // `get()` joins them just like `getJoined()`.
    return Array.isArray(value) ? value.join(', ') : value;
}

function setHeader(headers: HeadersInit | HeaderRecord, name: string, value: unknown): void {
    const stringValue = String(value);
    if (isHeaders(headers)) {
        (headers as Headers).set(name, stringValue);
    } else if (isEntries(headers)) {
        setPair(headers as unknown as HeaderEntries, name, stringValue);
    } else if (isRecord(headers)) {
        const record = headers;
        const folded = foldHeaderName(name);
        // Write to the key reads will find (exact first, folded retry for
        // lower-cased Node records) instead of creating a second entry.
        if (get(record, name) === undefined && folded !== name && get(record, folded) !== undefined) {
            set(record, folded, stringValue);
        } else {
            set(record, name, stringValue);
        }
    }
}

/**
 * Represents a single HTTP header name with helpers for common header collections.
 *
 * The instance stores only the header name; read and write methods adapt the
 * name to `Headers`, header tuples, and plain object maps.
 */
export class HTTPHeader implements Serializable {
    /**
     * The canonical header name used for reads and writes.
     */
    readonly name!: string;

    get [Symbol.toStringTag](): string {
        return `HTTPHeader:${this.name}`;
    }

    /**
     * Creates a header helper for the given name.
     *
     * @param name - The header name to target.
     */
    constructor(name: string) {
        /**
         * @readonly
         */
        defineProperty(this, 'name', {
            value: name,
            configurable: true,
            enumerable: true,
            writable: false,
        });
    }

    /**
     * Removes this header from a header collection when present.
     *
     * @param headers - The header collection to mutate.
     */
    delete(headers: HeadersInit | HeaderRecord): void {
        if (headers) {
            deleteHeader(headers, this.name);
        }
    }

    /**
     * Reads this header from a header collection.
     *
     * @param headers - The header collection to read from.
     * @returns The header value, or `null` when missing.
     */
    get(headers: HeadersInit | HeaderRecord): string | null {
        return headers ? getHeader(headers, this.name) : null;
    }

    /**
     * Reads this header from a header collection, joining multi-value
     * entries (`string[]` — Node server records) into one string.
     *
     * @param headers - The header collection to read from.
     * @param separator - The join separator (default `', '`).
     * @returns The header value, or `null` when missing.
     */
    getJoined(headers: HeadersInit | HeaderRecord, separator = ', '): string | null {
        const value = headers ? getHeaderValue(headers, this.name) : null;
        if (value === null) {
            return null;
        }
        return Array.isArray(value) ? value.join(separator) : value;
    }

    /**
     * Tests whether this header exists in a header collection.
     *
     * @param headers - The header collection to inspect.
     * @returns `true` when the header exists.
     */
    has(headers: HeadersInit | HeaderRecord): boolean {
        return headers ? getHeaderValue(headers, this.name) !== null : false;
    }

    /**
     * Writes this header into a mutable header collection.
     *
     * @param headers - The header collection to mutate.
     * @param value - The header value to store.
     * @throws {TypeError} When `headers` is not provided.
     */
    set(headers: HeadersInit | HeaderRecord, value: unknown): void {
        if (!headers) {
            throw new TypeError('headers is undefined');
        }
        setHeader(headers, this.name, value);
    }

    /**
     * @returns {module:core.JSONObject} A JSON representation of the HTTP header
     */
    toJSON(): JSONValue {
        return this.name;
    }

    /**
     * @returns {string} A string representation of the HTTP header
     */
    toString(): string {
        return this.name;
    }
}
