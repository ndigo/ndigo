/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { is, isString } from '@blue/util/types';
import QueryString from '../query-string';
import { HTTPInit, HTTPMethod, InitializationAwareHTTPInterceptor } from '../http';
import { entriesIterator } from '@blue/core';

/**
 * Body value accepted by {@link DataParameterInterceptor}.
 */
export type DataInit = BodyInit; // | JSONObject;
/**
 * Request settings for {@link DataParameterInterceptor}.
 */
export type DataParameterInit = HTTPInit & { data?: DataInit };

/**
 * @todo This interceptor could be more robust, e.g. it could do additional data processing,
 * * set a consistent Content-Type header, and/or read an existing Content-Type header
 * * to affect processing.
 */

const getEntries = (data: DataInit) => entriesIterator(isString(data) ? QueryString.parse(data) : data),
    getOrHead = /^(GET|HEAD)$/i,
    isBodyless = (method: HTTPMethod): boolean => getOrHead.test(method),
    isArrayBuffer = is(ArrayBuffer),
    isDataView = is(DataView),
    isFloat32Array = is(Float32Array),
    isFloat64Array = is(Float64Array),
    isInt8Array = is(Int8Array),
    isInt16Array = is(Int16Array),
    isInt32Array = is(Int32Array),
    isUint8Array = is(Uint8Array),
    isUint8ClampedArray = is(Uint8ClampedArray),
    isUint16Array = is(Uint16Array),
    isUint32Array = is(Uint32Array),
    isTypedArray = (value: unknown): boolean =>
        isFloat32Array(value) ||
        isFloat64Array(value) ||
        isInt8Array(value) ||
        isInt16Array(value) ||
        isInt32Array(value) ||
        isUint8Array(value) ||
        isUint8ClampedArray(value) ||
        isUint16Array(value) ||
        isUint32Array(value),
    isArrayBufferView = (value: unknown): boolean => isTypedArray(value) || isDataView(value),
    isBufferSource = (value: unknown): boolean => isArrayBuffer(value) || isArrayBufferView(value),
    isBlob = is(Blob),
    isFormData = is(FormData),
    isURLSearchParams = is(URLSearchParams),
    isReadableStream = is(ReadableStream),
    /**
     * @todo parseData() could be turned into an ifElse() where the identity() results are joined within an anyPass()...
     * ifElse( anyPass( [ isBlob, isBufferSource, ... ] ), identity, JSON.stringify );
     * I don't know if there are performance implications to either approach but I thought this approach laid out the logic more clearly.
     *
     */
    parseData = (value: DataInit): BodyInit => {
        if (isBlob(value)) return value;
        if (isBufferSource(value)) return value as ArrayBuffer;
        if (isFormData(value)) return value;
        if (isString(value)) return value;
        if (isURLSearchParams(value)) return value;
        if (isReadableStream(value)) return value;
        return JSON.stringify(value);
    };

/**
 * Moves `data` into the URL for bodyless methods and into `body` otherwise.
 */
export class DataParameterInterceptor implements InitializationAwareHTTPInterceptor<DataParameterInit> {
    /**
     * module:http.DataParameterInterceptor#preInit
     * @param {URL} url The requested URL.
     * @param {module:http.DataParameterInit} settings The HTTP request settings, including the `data` setting.
     * @returns {boolean} Whether or not the http request should continue execution.
     */
    preInit(url: URL, settings: DataParameterInit): boolean {
        if ('data' in settings) {
            const { data, method } = settings;
            if (method && isBodyless(method)) {
                if (data === undefined) {
                    return true;
                }
                const entries = getEntries(data);
                if (entries && typeof entries[Symbol.iterator] === 'function') {
                    for (const [key, value] of entries) {
                        url.searchParams.set(String(key), String(value));
                    }
                }
            } else {
                settings.body = parseData(data ?? '');
            }
        }
        return true;
    }
}
