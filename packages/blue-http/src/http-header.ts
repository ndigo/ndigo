/**
 * @author Jeff Rose
 */

import { isEntries, isJSONObject, JSONValue, Serializable } from '@blue/core';
import { is, isString } from '@blue/util/types';

const { defineProperty, deleteProperty, get, set } = Reflect,
    isHeaders = is(Headers) as (value: any) => value is Headers,
    isRecord = isJSONObject as (value: any) => value is Record<string, string>;

function deletePair(entries: any, name: string): void {
    const length = entries.length;

    if (length) {
        for (let index = 0; index < length; index++) {
            if (entries[index][0] === name) {
                deleteProperty(entries, index);
                break;
            }
        }
    }
}

function getPair(entries: any, name: string): string | null {
    const length = entries.length;

    if (length) {
        for (let index = 0; index < length; index++) {
            if (entries[index][0] === name) {
                return entries[index][1];
            }
        }
    }

    return null;
}

function setPair(entries: any, name: string, value: string): void {
    const length = entries.length;
    let found = false;

    if (length) {
        for (let index = 0; index < length; index++) {
            if (entries[index][0] === name) {
                entries[index][1] = value;
                found = true;
                break;
            }
        }
    }

    if (!found) {
        entries.push([name, value]);
    }
}

function deleteHeader(headers: HeadersInit, name: string): void {
    if (isHeaders(headers)) {
        (headers as Headers).delete(name);
    } else if (isEntries(headers)) {
        deletePair(headers, name);
    } else if (isRecord(headers)) {
        deleteProperty(headers as Record<string, string>, name);
    }
}

function getHeader(headers: HeadersInit, name: string): string | null {
    if (isHeaders(headers)) {
        return (headers as Headers).get(name);
    } else if (isEntries(headers)) {
        return getPair(headers, name);
    } else if (isRecord(headers)) {
        return get(headers as Record<string, string>, name) as string;
    }
    return null;
}

function hasHeader(headers: HeadersInit, name: string): boolean {
    return isString(getHeader(headers, name));
}

function setHeader(headers: HeadersInit, name: string, value: any): void {
    const stringValue = String(value);
    if (isHeaders(headers)) {
        (headers as Headers).set(name, stringValue);
    } else if (isEntries(headers)) {
        setPair(headers, name, stringValue);
    } else if (isRecord(headers)) {
        set(headers as Record<string, string>, name, stringValue);
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
    delete(headers: HeadersInit): void {
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
    get(headers: HeadersInit): string | null {
        return headers ? getHeader(headers, this.name) : null;
    }

    /**
     * Tests whether this header exists in a header collection.
     *
     * @param headers - The header collection to inspect.
     * @returns `true` when the header exists.
     */
    has(headers: HeadersInit): boolean {
        return headers ? hasHeader(headers, this.name) : false;
    }

    /**
     * Writes this header into a mutable header collection.
     *
     * @param headers - The header collection to mutate.
     * @param value - The header value to store.
     * @throws {TypeError} When `headers` is not provided.
     */
    set(headers: HeadersInit, value: any): void {
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
