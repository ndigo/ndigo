/**
 * @author Jeff Rose
 */
import { cond, isString, pipe, identity, ifElse, is, T, anyPass } from '@blue/util';
import QueryString from '../query-string';
import { entriesIterator } from '@blue/core';
/**
 * @typedef {module:http.HTTPInit} module:http.DataParameterInit
 * @property {external:BodyInit} [data]
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
 * @class module:http.DataParameterInterceptor
 * @implements module:http.InitializationAwareHTTPInterceptor
 */
export class DataParameterInterceptor {
    /**
     * module:http.DataParameterInterceptor#preInit
     * @param {external:URL} url The requested URL.
     * @param {module:http.DataParameterInit} settings The HTTP request settings, including the `data` setting.
     * @returns {external:boolean} Whether or not the http request should continue execution.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS1wYXJhbWV0ZXItaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW50ZXJjZXB0b3JzL2RhdGEtcGFyYW1ldGVyLWludGVyY2VwdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLElBQUksRUFBVSxRQUFRLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDNUYsT0FBTyxXQUFXLE1BQU0saUJBQWlCLENBQUM7QUFFMUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUs3Qzs7O0dBR0c7QUFFSDs7OztHQUlHO0FBRUgsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsV0FBVyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsRUFBRSxlQUFlLENBQUMsRUFDbkYsU0FBUyxHQUFHLGVBQWUsRUFDM0IsVUFBVSxHQUFHLENBQUMsTUFBa0IsRUFBVyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFDcEUsYUFBYSxHQUFHLEVBQUUsQ0FBQyxXQUFXLENBQUMsRUFDL0IsVUFBVSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFDekIsWUFBWSxHQUFHLE9BQU8sQ0FBQztJQUNuQixFQUFFLENBQUMsWUFBWSxDQUFDO0lBQ2hCLEVBQUUsQ0FBQyxZQUFZLENBQUM7SUFDaEIsRUFBRSxDQUFDLFNBQVMsQ0FBQztJQUNiLEVBQUUsQ0FBQyxVQUFVLENBQUM7SUFDZCxFQUFFLENBQUMsVUFBVSxDQUFDO0lBQ2QsRUFBRSxDQUFDLFVBQVUsQ0FBQztJQUNkLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQztJQUNyQixFQUFFLENBQUMsV0FBVyxDQUFDO0lBQ2YsRUFBRSxDQUFDLFdBQVcsQ0FBQztDQUNsQixDQUFDLEVBQ0YsaUJBQWlCLEdBQUcsQ0FBQyxLQUFVLEVBQVcsRUFBRSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsSUFBSSxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQ3JGLGNBQWMsR0FBRyxDQUFDLEtBQVUsRUFBVyxFQUFFLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxJQUFJLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxFQUMxRixNQUFNLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUNqQixVQUFVLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUN6QixpQkFBaUIsR0FBRyxFQUFFLENBQUMsZUFBZSxDQUFDLEVBQ3ZDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQyxjQUFjLENBQUM7QUFDckM7Ozs7O0dBS0c7QUFDSCxTQUFTLEdBQUcsSUFBSSxDQUFDO0lBQ2IsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDO0lBQ2xCLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQztJQUMxQixDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUM7SUFDdEIsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDO0lBQ3BCLENBQUMsaUJBQWlCLEVBQUUsUUFBUSxDQUFDO0lBQzdCLENBQUMsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDO0lBQzVCLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7Q0FDdEIsQ0FBa0MsQ0FBQztBQUV4Qzs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sd0JBQXdCO0lBQ2pDOzs7OztPQUtHO0lBQ0gsT0FBTyxDQUFDLEdBQVEsRUFBRSxRQUEyQjtRQUN6QyxJQUFJLE1BQU0sSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUNyQixNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQztZQUNsQyxJQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDO2dCQUNyQixNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2pDLElBQUksT0FBTyxJQUFJLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxVQUFVLEVBQUUsQ0FBQztvQkFDNUQsS0FBSyxNQUFNLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLE9BQWtDLEVBQUUsQ0FBQzt3QkFDNUQsR0FBRyxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUNyRCxDQUFDO2dCQUNMLENBQUM7WUFDTCxDQUFDO2lCQUFNLENBQUM7Z0JBQ0osUUFBUSxDQUFDLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDcEMsQ0FBQztRQUNMLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBQ0oifQ==