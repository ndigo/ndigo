/**
 * @author Jeff Rose
 */
import { cond, isString, pipe, identity, ifElse, is, T, anyPass } from '@blue/util';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS1wYXJhbWV0ZXItaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW50ZXJjZXB0b3JzL2RhdGEtcGFyYW1ldGVyLWludGVyY2VwdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLElBQUksRUFBVSxRQUFRLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDNUYsT0FBTyxXQUFXLE1BQU0saUJBQWlCLENBQUM7QUFFMUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUs3Qzs7O0dBR0c7QUFFSDs7OztHQUlHO0FBRUgsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsRUFBRSxlQUFlLENBQUMsRUFDbkYsU0FBUyxHQUFHLGVBQWUsRUFDM0IsVUFBVSxHQUFHLENBQUMsTUFBa0IsRUFBVyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFDcEUsYUFBYSxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFDL0IsVUFBVSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFDekIsWUFBWSxHQUFHLE9BQU8sQ0FBQztJQUNuQixFQUFFLENBQUMsWUFBWSxDQUFDO0lBQ2hCLEVBQUUsQ0FBQyxZQUFZLENBQUM7SUFDaEIsRUFBRSxDQUFDLFNBQVMsQ0FBQztJQUNiLEVBQUUsQ0FBQyxVQUFVLENBQUM7SUFDZCxFQUFFLENBQUMsVUFBVSxDQUFDO0lBQ2QsRUFBRSxDQUFDLFVBQVUsQ0FBQztJQUNkLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztJQUNyQixFQUFFLENBQUMsV0FBVyxDQUFDO0lBQ2YsRUFBRSxDQUFDLFdBQVcsQ0FBQztDQUNsQixDQUFDLEVBQ0YsaUJBQWlCLEdBQUcsQ0FBQyxLQUFVLEVBQVcsRUFBRSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQ3JGLGNBQWMsR0FBRyxDQUFDLEtBQVUsRUFBVyxFQUFFLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxJQUFJLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxFQUMxRixNQUFNLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUNqQixVQUFVLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUN6QixpQkFBaUIsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDLEVBQ3ZDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQyxjQUFjLENBQUM7QUFDckM7Ozs7O0dBS0c7QUFDSCxTQUFTLEdBQUcsSUFBSSxDQUFDO0lBQ2IsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDO0lBQ2xCLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQztJQUMxQixDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUM7SUFDdEIsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDO0lBQ3BCLENBQUMsaUJBQWlCLEVBQUUsUUFBUSxDQUFDO0lBQzdCLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDO0lBQzVCLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7Q0FDdEIsQ0FBa0MsQ0FBQztBQUV4Qzs7R0FFRztBQUNILE1BQU0sT0FBTyx3QkFBd0I7SUFDakM7Ozs7O09BS0c7SUFDSCxPQUFPLENBQUMsR0FBUSxFQUFFLFFBQTJCO1FBQ3pDLElBQUksTUFBTSxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQ3JCLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDO1lBQ2xDLElBQUksVUFBVSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7Z0JBQ3JCLE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDakMsSUFBSSxPQUFPLElBQUksT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLFVBQVUsRUFBRSxDQUFDO29CQUM1RCxLQUFLLE1BQU0sQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksT0FBa0MsRUFBRSxDQUFDO3dCQUM1RCxHQUFHLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ3JELENBQUM7Z0JBQ0wsQ0FBQztZQUNMLENBQUM7aUJBQU0sQ0FBQztnQkFDSixRQUFRLENBQUMsSUFBSSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwQyxDQUFDO1FBQ0wsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7Q0FDSiJ9