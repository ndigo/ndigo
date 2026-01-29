/**
 * @author Jeff Rose
 */
import { identity, pipe, T } from '@blue/util/function';
import { anyPass, cond, ifElse } from '@blue/util/logic';
import { is, isString } from '@blue/util/types';
import QueryString from '../query-string';
import { entriesIterator } from '@blue/core';
/**
 * @typedef {module:http.HTTPInit} module:http.DataParameterInit
 * @property {BodyInit} [data]
 */
/**
 * * This interceptor could be more robust, e.g. it could do additional data processing,
 * * set a consistent Content-Type header, and/or read an existing Content-Type header
 * * to affect processing. -JBR
 */
const getEntries = pipe(ifElse(isString, QueryString.parse, identity), entriesIterator), getOrHead = /^(GET|HEAD)$/i, isBodyless = (method) => getOrHead.test(method), isArrayBuffer = is(ArrayBuffer), isDataView = is(DataView), isTypedArray = anyPass([
    is(Float32Array),
    is(Float64Array),
    is(Int8Array),
    is(Int16Array),
    is(Int32Array),
    is(Uint8Array),
    is(Uint8ClampedArray),
    is(Uint16Array),
    is(Uint32Array),
]), isArrayBufferView = (value) => isTypedArray(value) || isDataView(value), isBufferSource = (value) => isArrayBuffer(value) || isArrayBufferView(value), isBlob = is(Blob), isFormData = is(FormData), isURLSearchParams = is(URLSearchParams), isReadableStream = is(ReadableStream), 
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
]);
/**
 * @implements module:http.InitializationAwareHTTPInterceptor
 */
export class DataParameterInterceptor {
    /**
     * module:http.DataParameterInterceptor#preInit
     * @param {URL} url The requested URL.
     * @param {module:http.DataParameterInit} settings The HTTP request settings, including the `data` setting.
     * @returns {boolean} Whether or not the http request should continue execution.
     */
    preInit(url, settings) {
        if ('data' in settings) {
            const { data, method } = settings;
            if (isBodyless(method)) {
                const entries = getEntries(data);
                if (entries && typeof entries[Symbol.iterator] === 'function') {
                    for (const [key, value] of entries) {
                        url.searchParams.set(String(key), String(value));
                    }
                }
            }
            else {
                settings.body = parseData(data);
            }
        }
        return true;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS1wYXJhbWV0ZXItaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW50ZXJjZXB0b3JzL2RhdGEtcGFyYW1ldGVyLWludGVyY2VwdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDeEQsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQVUsTUFBTSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDakUsT0FBTyxFQUFFLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNoRCxPQUFPLFdBQVcsTUFBTSxpQkFBaUIsQ0FBQztBQUUxQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBSzdDOzs7R0FHRztBQUVIOzs7O0dBSUc7QUFFSCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxFQUFFLGVBQWUsQ0FBQyxFQUNuRixTQUFTLEdBQUcsZUFBZSxFQUMzQixVQUFVLEdBQUcsQ0FBQyxNQUFrQixFQUFXLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUNwRSxhQUFhLEdBQUcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxFQUMvQixVQUFVLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUN6QixZQUFZLEdBQUcsT0FBTyxDQUFDO0lBQ25CLEVBQUUsQ0FBQyxZQUFZLENBQUM7SUFDaEIsRUFBRSxDQUFDLFlBQVksQ0FBQztJQUNoQixFQUFFLENBQUMsU0FBUyxDQUFDO0lBQ2IsRUFBRSxDQUFDLFVBQVUsQ0FBQztJQUNkLEVBQUUsQ0FBQyxVQUFVLENBQUM7SUFDZCxFQUFFLENBQUMsVUFBVSxDQUFDO0lBQ2QsRUFBRSxDQUFDLGlCQUFpQixDQUFDO0lBQ3JCLEVBQUUsQ0FBQyxXQUFXLENBQUM7SUFDZixFQUFFLENBQUMsV0FBVyxDQUFDO0NBQ2xCLENBQUMsRUFDRixpQkFBaUIsR0FBRyxDQUFDLEtBQVUsRUFBVyxFQUFFLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFDckYsY0FBYyxHQUFHLENBQUMsS0FBVSxFQUFXLEVBQUUsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLElBQUksaUJBQWlCLENBQUMsS0FBSyxDQUFDLEVBQzFGLE1BQU0sR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQ2pCLFVBQVUsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQ3pCLGlCQUFpQixHQUFHLEVBQUUsQ0FBQyxlQUFlLENBQUMsRUFDdkMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDLGNBQWMsQ0FBQztBQUNyQzs7Ozs7R0FLRztBQUNILFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDYixDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUM7SUFDbEIsQ0FBQyxjQUFjLEVBQUUsUUFBUSxDQUFDO0lBQzFCLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQztJQUN0QixDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUM7SUFDcEIsQ0FBQyxpQkFBaUIsRUFBRSxRQUFRLENBQUM7SUFDN0IsQ0FBQyxnQkFBZ0IsRUFBRSxRQUFRLENBQUM7SUFDNUIsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztDQUN0QixDQUFrQyxDQUFDO0FBRXhDOztHQUVHO0FBQ0gsTUFBTSxPQUFPLHdCQUF3QjtJQUNqQzs7Ozs7T0FLRztJQUNILE9BQU8sQ0FBQyxHQUFRLEVBQUUsUUFBMkI7UUFDekMsSUFBSSxNQUFNLElBQUksUUFBUSxFQUFFLENBQUM7WUFDckIsTUFBTSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUM7WUFDbEMsSUFBSSxVQUFVLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztnQkFDckIsTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNqQyxJQUFJLE9BQU8sSUFBSSxPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEtBQUssVUFBVSxFQUFFLENBQUM7b0JBQzVELEtBQUssTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxPQUFrQyxFQUFFLENBQUM7d0JBQzVELEdBQUcsQ0FBQyxZQUFZLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztvQkFDckQsQ0FBQztnQkFDTCxDQUFDO1lBQ0wsQ0FBQztpQkFBTSxDQUFDO2dCQUNKLFFBQVEsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3BDLENBQUM7UUFDTCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKIn0=