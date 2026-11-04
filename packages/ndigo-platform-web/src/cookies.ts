/**
 * @module ndigo-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { createNull, JSONObject, JSONValue } from '@ndigo/core';
import cookieExpression from './parser/cookie-expression';
import { getLogger } from '@ndigo/log';

const logger = getLogger('ndigo-platform-web:cookies');

/** Parsed cookie structure returned by cookie parsing helpers. */
export interface Cookie {
    name: string;
    value: string;
    domain?: string;
    expires?: string;
    maxAge?: string;
    path?: string;
    sameSite?: string;
    secure?: boolean;
}

/** Minimal cookie-jar API exposed by the platform-web package. */
export interface CookieJar {
    get(key: string): JSONValue | undefined;
    getJSON(key: string): JSONValue | undefined;
    remove(key: string, attributes?: CookieAttributes): string;
    set(key: string, value: string, attributes?: CookieAttributes): string;
    run(input: string): CookieParseResult;
}

type CookieAttributeValue = string | number | boolean | Date;

/**
 * Additional attributes to append to a cookie (e.g. path, expires, secure).
 */
export type CookieAttributes = {
    [name: string]: CookieAttributeValue;
};

type CookieConverter = {
    write?: (value: string, key: string) => string;
};

/**
 * Parsed result returned by the cookie parser.
 */
export type CookieParseResult =
    | { isError: false; result: JSONObject; index: number; data: unknown }
    | { isError: true; error: string; index: number; data: unknown };
type CookieParseSuccess = Extract<CookieParseResult, { isError: false }>;

/** Parser shape of the cookie-expression parser, which always succeeds. */
type CookieParser = {
    run: (input: string) => CookieParseSuccess;
};

const cookieParser = cookieExpression as CookieParser;

const { assign } = Object;

/** Parses the browser cookie string using the package parser. */
function parseCookieJar(input: string): CookieParseSuccess {
    return cookieParser.run(input);
}

/** Creates a cookie-jar API bound to the current browser environment. */
function init(converter: CookieConverter = {}): CookieJar {
    // Progressive construction: the jar methods are attached below after the closure
    // definitions, so the object starts as a bare null-prototype and is widened.
    const api = createNull() as unknown as CookieJar & { defaults: CookieAttributes; withConverter: typeof init };

    function set(key: string, value: string, attributes?: CookieAttributes): string {
        if (typeof document === 'undefined') {
            return '';
        }

        const finalAttributes: CookieAttributes = assign({ path: '/' }, api.defaults, attributes);

        if (typeof finalAttributes.expires === 'number') {
            finalAttributes.expires = new Date(Date.now() * 1 + finalAttributes.expires * 864e5);
        }

        // We're using "expires" because "max-age" is not supported by IE
        finalAttributes.expires = finalAttributes.expires instanceof Date ? finalAttributes.expires.toUTCString() : '';

        try {
            const result = JSON.stringify(value);
            if (/^[{[[]/.test(result)) {
                value = result;
            }
        } catch (e) {
            logger.warn('[Cookies] Failed to stringify cookie value:', {
                error: e instanceof Error ? e.message : String(e),
            });
        }

        value = converter.write
            ? converter.write(value, key)
            : encodeURIComponent(String(value)).replace(
                  /%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,
                  decodeURIComponent
              );

        key = encodeURIComponent(String(key))
            .replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
            .replace(/[()]/g, (character: string) => encodeURIComponent(character));

        let stringifiedAttributes = '';
        for (const attributeName in finalAttributes) {
            if (!finalAttributes[attributeName]) {
                continue;
            }
            // SE-11: attribute names are inserted verbatim, so a name carrying
            // `;`/CR/LF would inject further attributes. Names are code-owned
            // (`path`, `domain`, …) — reject loudly instead of sanitizing.
            if (/[;\r\n]/.test(attributeName)) {
                throw new TypeError(`Cookie attribute name "${attributeName}" must not contain ";", CR, or LF`);
            }
            stringifiedAttributes += '; ' + attributeName;
            if (finalAttributes[attributeName] === true) {
                continue;
            }

            // Considers RFC 6265 section 5.2:
            // ...
            // 3.  If the remaining unparsed-attributes contains a %x3B (";")
            //     character:
            // Consume the characters of the unparsed-attributes up to,
            // not including, the first %x3B (";") character.
            // ...
            // SE-11: split on the first ";" — `.split(' ;')` only stripped
            // space-preceded injections (`;evil=1` passed through untouched).
            stringifiedAttributes += '=' + String(finalAttributes[attributeName]).split(';')[0];
        }

        return (document.cookie = key + '=' + value + stringifiedAttributes);
    }

    function get(key: string, json: boolean): JSONValue | undefined {
        // Symmetric with `set()`: outside a DOM there is no cookie jar to read.
        if (typeof document === 'undefined') {
            return undefined;
        }

        const jar: JSONObject = parseCookieJar(document.cookie).result;

        if (!key) {
            return jar;
        }

        const value = jar[key] as JSONValue | undefined;

        if (value === undefined || !json) {
            return value;
        }

        // A present-but-non-JSON cookie value must not throw on read.
        try {
            return JSON.parse(value as string) as JSONValue;
        } catch {
            return undefined;
        }
    }

    api.set = set;
    api.get = (key: string): JSONValue | undefined => get(key, false /* read as raw */);
    api.getJSON = (key: string): JSONValue | undefined => get(key, true /* read as json */);
    // Fresh attribute object: `remove` must not mutate the caller's attributes.
    api.remove = (key: string, attributes?: CookieAttributes): string =>
        set(key, '', assign({}, attributes, { expires: -1 }));

    // Expose cookie parser for consumers/tests that want direct parsing.
    api.run = (input: string): CookieParseResult => parseCookieJar(input);

    api.defaults = {};

    api.withConverter = init;

    return api;
}

/**
 * Default cookie jar bound to the current browser environment.
 *
 * Exported both as a named `Cookies` binding (the documented import) and as
 * the module default.
 */
export const Cookies: CookieJar = init();

export default Cookies;
