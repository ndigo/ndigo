/**
 * @author Jeff Rose
 */

import { isEntries, isJSONObject, JSONValue, Serializable } from '@blue/core';
import { always, T } from '@blue/util/function';
import { cond } from '@blue/util/logic';
import { is, isString } from '@blue/util/types';

const { defineProperty, deleteProperty, get, set } = Reflect,
    alwaysNull = always(null),
    noop = always(void 0),
    isHeaders = is(Headers) as (value) => value is Headers,
    isRecord = isJSONObject as (value) => value is Record<string, string>;

function deletePair(entries, name: string): void {
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

function getPair(entries, name: string): string {
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

function setPair(entries, name: string, value: string): void {
    const length = entries.length;
    let found = false;

    if (length) {
        for (let index = 0; index < length; index++) {
            if (entries[index][0] === name) {
                // @ts-ignore: ¯\_(ツ)_/¯
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
    cond([
        [isHeaders, (h: Headers) => h.delete(name)],
        [isEntries, (h) => deletePair(h, name)],
        [isRecord, (h: Record<string, string>) => deleteProperty(h, name)],
        [T, noop],
    ])(headers);
}

function getHeader(headers: HeadersInit, name: string): string {
    return cond([
        [isHeaders, (h: Headers) => h.get(name)],
        [isEntries, (h) => getPair(h, name)],
        [isRecord, (h: Record<string, string>) => get(h, name)],
        [T, alwaysNull],
    ])(headers);
}

function hasHeader(headers: HeadersInit, name: string): boolean {
    return isString(getHeader(headers, name));
}

function setHeader(headers: HeadersInit, name: string, value): void {
    const stringValue = String(value);
    cond([
        [isHeaders, (h: Headers) => h.set(name, stringValue)],
        [isEntries, (h) => setPair(h, name, stringValue)],
        [isRecord, (h: Record<string, string>) => set(h, name, stringValue)],
        [T, noop],
    ])(headers);
}

/**
 * Represents a single HTTP header name with helpers for common header collections.
 *
 * The instance stores only the header name; read and write methods adapt the
 * name to `Headers`, header tuples, and plain object maps.
 *
 * @implements module:core.Serializable
 */
export class HTTPHeader implements Serializable {
    /**
     * The canonical header name used for reads and writes.
     */
    readonly name: string;

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
        headers && deleteHeader(headers, this.name);
    }

    /**
     * Reads this header from a header collection.
     *
     * @param headers - The header collection to read from.
     * @returns The header value, or `null` when missing.
     */
    get(headers: HeadersInit): string {
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
    set(headers: HeadersInit, value): void {
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
