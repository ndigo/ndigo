/**
 * @author Jeff Rose
 */
import { ETAG, IF_MODIFIED_SINCE, IF_NONE_MATCH, LAST_MODIFIED } from '../http-headers';
/**
 * @typedef {module:http.HTTPInit} module:http.IfModifiedInit
 * @property {external:boolean} [ifModified]
 */
/**
 * @class module:http.IfModifiedInterceptor
 * @implements module:http.InitializationAwareHTTPInterceptor
 * @implements module:http.ResponseAwareHTTPInterceptor
 */
export class IfModifiedInterceptor {
    #eTag;
    #lastModified;
    constructor() {
        this.#eTag = new Map();
        this.#lastModified = new Map();
    }
    /**
     * @function module:http.IfModifiedInterceptor#preInit
     * @param {external:URL} url The requested URL.
     * @param {module:http.IfModifiedInit} settings The HTTP request settings, including the `ifModified` setting.
     * @returns {external:boolean} Whether or not the http request should continue execution.
     */
    preInit(url, settings) {
        if (settings.ifModified) {
            const headers = new Headers(settings.headers ?? {}), fullURL = url.toString();
            this.#lastModified.has(fullURL) && IF_MODIFIED_SINCE.set(headers, this.#lastModified.get(fullURL));
            this.#eTag.has(fullURL) && IF_NONE_MATCH.set(headers, this.#eTag.get(fullURL));
            settings.headers = headers;
        }
        return true;
    }
    /**
     * @async
     * @function module:http.IfModifiedInterceptor#postResponse
     * @param {external:Response} response
     * @param {module:http.IfModifiedInit} settings
     * @returns {external:Promise<external:void>}
     */
    async postResponse({ headers, url }, settings) {
        if (settings.ifModified) {
            LAST_MODIFIED.has(headers) && this.#lastModified.set(url, LAST_MODIFIED.get(headers));
            ETAG.has(headers) && this.#eTag.set(url, ETAG.get(headers));
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWYtbW9kaWZpZWQtaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW50ZXJjZXB0b3JzL2lmLW1vZGlmaWVkLWludGVyY2VwdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBR0gsT0FBTyxFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFJeEY7OztHQUdHO0FBRUg7Ozs7R0FJRztBQUNILE1BQU0sT0FBTyxxQkFBcUI7SUFHOUIsS0FBSyxDQUFzQjtJQUMzQixhQUFhLENBQXNCO0lBRW5DO1FBQ0ksSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztRQUN2QyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO0lBQ25ELENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILE9BQU8sQ0FBQyxHQUFRLEVBQUUsUUFBd0I7UUFDdEMsSUFBSSxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDdEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsRUFDL0MsT0FBTyxHQUFHLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUM3QixJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDbkcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztZQUMvRSxRQUFRLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUMvQixDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNILEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFZLEVBQUUsUUFBd0I7UUFDbkUsSUFBSSxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDdEIsYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3RGLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNoRSxDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=