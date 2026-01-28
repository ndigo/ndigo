/**
 * @author Jeff Rose
 */
import { ETAG, IF_MODIFIED_SINCE, IF_NONE_MATCH, LAST_MODIFIED } from '../http-headers';
/**
 * @typedef {module:http.HTTPInit} module:http.IfModifiedInit
 * @property {boolean} [ifModified]
 */
/**
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
     * @param {URL} url The requested URL.
     * @param {module:http.IfModifiedInit} settings The HTTP request settings, including the `ifModified` setting.
     * @returns {boolean} Whether or not the http request should continue execution.
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
     * @param {Response} response
     * @param {module:http.IfModifiedInit} settings
     * @returns {Promise<external:void>}
     */
    async postResponse({ headers, url }, settings) {
        if (settings.ifModified) {
            LAST_MODIFIED.has(headers) && this.#lastModified.set(url, LAST_MODIFIED.get(headers));
            ETAG.has(headers) && this.#eTag.set(url, ETAG.get(headers));
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWYtbW9kaWZpZWQtaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvaW50ZXJjZXB0b3JzL2lmLW1vZGlmaWVkLWludGVyY2VwdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBR0gsT0FBTyxFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFJeEY7OztHQUdHO0FBRUg7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLHFCQUFxQjtJQUc5QixLQUFLLENBQXNCO0lBQzNCLGFBQWEsQ0FBc0I7SUFFbkM7UUFDSSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxFQUFrQixDQUFDO1FBQ3ZDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxHQUFHLEVBQWtCLENBQUM7SUFDbkQsQ0FBQztJQUVEOzs7O09BSUc7SUFDSCxPQUFPLENBQUMsR0FBUSxFQUFFLFFBQXdCO1FBQ3RDLElBQUksUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3RCLE1BQU0sT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDLEVBQy9DLE9BQU8sR0FBRyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDN0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksaUJBQWlCLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ25HLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDL0UsUUFBUSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDL0IsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILEtBQUssQ0FBQyxZQUFZLENBQUMsRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFZLEVBQUUsUUFBd0I7UUFDbkUsSUFBSSxRQUFRLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDdEIsYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1lBQ3RGLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUNoRSxDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=