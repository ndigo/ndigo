/**
 * @author Jeff Rose
 */

import { createNull, JSONObject, JSONValue } from '@blue/core';
import cookieExpression from './parser/cookie-expression';
import { decodeURIComponent as decode } from '@blue/util/string';

/** Minimal parser shape: an object with a run method returning a success or failure. */
type Parser<T> = {
    run: (
        input: string
    ) => { isError: false; result: T; index: number; data: unknown } | { isError: true; error: string; index: number; data: unknown };
};

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
    get(key: string): JSONValue;
    getJSON(key: string): JSONValue;
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

type CookieParser = Parser<JSONObject>;

/**
 * Parsed result returned by the cookie parser.
 */
export type CookieParseResult = ReturnType<Parser<JSONObject>['run']>;
type CookieParseSuccess = Extract<CookieParseResult, { isError: false }>;

const cookieParser = cookieExpression as CookieParser;

const { assign } = Object;

/** Parses the browser cookie string using the package parser. */
function parseCookieJar(input: string): CookieParseResult {
    return cookieParser.run(input);
}

/** Narrows a parse result to a successful parse. */
function isCookieParseSuccess(result: CookieParseResult): result is CookieParseSuccess {
    return result.isError === false;
}

/** Creates a cookie-jar API bound to the current browser environment. */
function init(converter: CookieConverter = {}): CookieJar {
    const api = createNull();

    function set(key: string, value: string, attributes?: CookieAttributes): string {
        if (typeof document === 'undefined') {
            return;
        }

        attributes = assign({ path: '/' }, api.defaults, attributes);

        if (typeof attributes.expires === 'number') {
            attributes.expires = new Date(Date.now() * 1 + attributes.expires * 864e5);
        }

        // We're using "expires" because "max-age" is not supported by IE
        attributes.expires = attributes.expires instanceof Date ? attributes.expires.toUTCString() : '';

        try {
            const result = JSON.stringify(value);
            if (/^[\{\[]/.test(result)) {
                value = result;
            }
        } catch (e) {
            console.warn('[Cookies] Failed to stringify cookie value:', e);
        }

        value = converter.write
            ? converter.write(value, key)
            : encodeURIComponent(String(value)).replace(
                  /%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,
                  decodeURIComponent
              );

        key = encodeURIComponent(String(key))
            .replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
            .replace(/[\(\)]/g, (character: string) => encodeURIComponent(character));

        let stringifiedAttributes = '';
        for (const attributeName in attributes) {
            if (!attributes[attributeName]) {
                continue;
            }
            stringifiedAttributes += '; ' + attributeName;
            if (attributes[attributeName] === true) {
                continue;
            }

            // Considers RFC 6265 section 5.2:
            // ...
            // 3.  If the remaining unparsed-attributes contains a %x3B (";")
            //     character:
            // Consume the characters of the unparsed-attributes up to,
            // not including, the first %x3B (";") character.
            // ...
            stringifiedAttributes += '=' + String(attributes[attributeName]).split(' ;')[0];
        }

        return (document.cookie = key + '=' + value + stringifiedAttributes);
    }

    function get(key: string, json: boolean): JSONValue {
        const parseResult = parseCookieJar(document.cookie);
        if (!isCookieParseSuccess(parseResult)) {
            const fallbackCookies = String(document.cookie || '').trim();
            if (!fallbackCookies) {
                return key ? undefined : createNull();
            }

            const pairs = fallbackCookies.split('; ');
            const jar = pairs.reduce((result: JSONObject, pair: string): JSONObject => {
                const separatorIndex = pair.indexOf('=');
                if (separatorIndex < 0) {
                    return result;
                }

                const rawKey = pair.slice(0, separatorIndex);
                const rawValue = pair.slice(separatorIndex + 1);
                result[decode(rawKey)] = decode(rawValue);

                return result;
            }, createNull() as JSONObject);

            return key ? (json ? JSON.parse(jar[key] as string) : jar[key]) : jar;
        }
        const jar: JSONObject = parseResult.result;
        return key ? (json ? JSON.parse(jar[key] as string) : jar[key]) : jar;
    }

    api.set = set;
    api.get = (key: string): JSONValue => get(key, false /* read as raw */);
    api.getJSON = (key: string): JSONValue => get(key, true /* read as json */);
    api.remove = (key: string, attributes?: CookieAttributes): string =>
        set(key, '', assign(attributes, { expires: -1 }));

    // Expose cookie parser for consumers/tests that want direct parsing.
    api.run = (input: string): CookieParseResult => parseCookieJar(input);

    api.defaults = {};

    api.withConverter = init;

    return api;
}

/** Default cookie jar bound to the current browser environment. */
export default init();
