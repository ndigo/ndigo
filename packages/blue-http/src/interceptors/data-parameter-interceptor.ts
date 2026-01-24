/**
 * @author Jeff Rose
 */

import { cond, either, isString, pipe, identity, ifElse, is, T, anyPass } from '@blue/util';
import QueryString from '../query-string';
import { HTTPInit, HTTPMethod, InitializationAwareHTTPInterceptor } from '../http';
import { entriesIterator } from '@blue/core';

export type DataInit = BodyInit; // | JSONObject;
export type DataParameterInit = HTTPInit & { data?: DataInit };

/**
 * @typedef {module:http.HTTPInit} module:http.DataParameterInit
 * @property {external:BodyInit} [data]
 */

/**
 * * This interceptor could be more robust, e.g. it could do additional data processing,
 * * set a consistent Content-Type header, and/or read an existing Content-Type header
 * * to affect processing. -JBR
 */

const getEntries = pipe(ifElse(isString, QueryString.parse, identity), entriesIterator),
    getOrHead = /^(GET|HEAD)$/i,
    isBodyless = (method: HTTPMethod): boolean => getOrHead.test(method),
    isArrayBuffer = is(ArrayBuffer),
    isDataView = is(DataView),
    isTypedArray = anyPass([
        is(Float32Array),
        is(Float64Array),
        is(Int8Array),
        is(Int16Array),
        is(Int32Array),
        is(Uint8Array),
        is(Uint8ClampedArray),
        is(Uint16Array),
        is(Uint32Array),
    ]),
    isArrayBufferView = (value: any): boolean => isTypedArray(value) || isDataView(value),
    isBufferSource = (value: any): boolean => isArrayBuffer(value) || isArrayBufferView(value),
    isBlob = is(Blob),
    isFormData = is(FormData),
    isURLSearchParams = is(URLSearchParams),
    isReadableStream = is(ReadableStream),
    /*
     * parseData() could be turned into an ifElse() where the identity() results are joined within an anyPass()...
     * ifElse( anyPass( [ isBlob, isBufferSource, ... ] ), identity, JSON.stringify );
     * I don't know if there are performance implications to either approach but I thought this approach laid out the logic more clearly.
     * -JBR
     */
    parseData = cond([
        [isBlob, identity],
        [isBufferSource, identity],
        [isFormData, identity],
        [isString, identity],
        [isURLSearchParams, identity],
        [isReadableStream, identity],
        [T, JSON.stringify],
    ]) as (value: DataInit) => BodyInit;

/**
 * @class module:http.DataParameterInterceptor
 * @implements module:http.InitializationAwareHTTPInterceptor
 */
export class DataParameterInterceptor implements InitializationAwareHTTPInterceptor<DataParameterInit> {
    /**
     * module:http.DataParameterInterceptor#preInit
     * @param {external:URL} url The requested URL.
     * @param {module:http.DataParameterInit} settings The HTTP request settings, including the `data` setting.
     * @returns {external:boolean} Whether or not the http request should continue execution.
     */
    preInit(url: URL, settings: DataParameterInit): boolean {
        if ('data' in settings) {
            const { data, method } = settings;
            if (isBodyless(method)) {
                const entries = getEntries(data);
                if (entries && typeof entries[Symbol.iterator] === 'function') {
                    for (const [key, value] of entries as Iterable<[string, any]>) {
                        url.searchParams.set(String(key), String(value));
                    }
                }
            } else {
                settings.body = parseData(data);
            }
        }
        return true;
    }
}
