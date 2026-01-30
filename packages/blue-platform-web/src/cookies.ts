/**
 * @author Jeff Rose
 */

import { createNull, JSONObject, JSONValue } from '@blue/core';
import { Parser, Ok } from 'arcsecond';
import cookieExpression from './parser/cookie-expression';

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

export interface CookieJar {
    get(key: string): JSONValue;
    getJSON(key: string): JSONValue;
    remove(key: string, attributes): string;
    set(key: string, value: string, attributes): string;
    run(input: string): unknown;
}

const { assign } = Object;

function init(converter): CookieJar {
    const api = createNull();

    function set(key: string, value: string, attributes): string {
        if (typeof document === 'undefined') {
            return;
        }

        attributes = assign({ path: '/' }, api.defaults, attributes);

        if (typeof attributes.expires === 'number') {
            attributes.expires = new Date(Date.now() * 1 + attributes.expires * 864e5);
        }

        // We're using "expires" because "max-age" is not supported by IE
        attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

        try {
            const result = JSON.stringify(value);
            if (/^[\{\[]/.test(result)) {
                value = result;
            }
        } catch (e) {}

        value = converter.write
            ? converter.write(value, key)
            : encodeURIComponent(String(value)).replace(
                  /%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g,
                  decodeURIComponent
              );

        key = encodeURIComponent(String(key))
            .replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
            .replace(/[\(\)]/g, escape);

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
            stringifiedAttributes += '=' + attributes[attributeName].split(' ;')[0];
        }

        return (document.cookie = key + '=' + value + stringifiedAttributes);
    }

    function get(key: string, json: boolean): JSONValue {
        const parseResult = (cookieExpression as Parser<Array<[string, string]>>).run(document.cookie);
        if (parseResult.isError) {
            console.error('Cookie parsing error:', parseResult.error);
            return createNull();
        }
        const rawCookies: Array<[string, string]> = (parseResult as Ok<Array<[string, string]>, string>).result;

        const jar: JSONObject = Object.fromEntries(rawCookies) as JSONObject;
        return key ? (json ? JSON.parse(jar[key] as string) : jar[key]) : jar;
    }

    api.set = set;
    api.get = (key: string): JSONValue => get(key, false /* read as raw */);
    api.getJSON = (key: string): JSONValue => get(key, true /* read as json */);
    api.remove = (key: string, attributes): string => set(key, '', assign(attributes, { expires: -1 }));

    // Expose cookie parser for consumers/tests that want direct parsing.
    api.run = (input: string): unknown => (cookieExpression as Parser<unknown>).run(input);

    api.defaults = {};

    api.withConverter = init;

    return api;
}

export default init(function () {});
