/**
 * @author Jeff Rose
 */
import { CONTENT_TYPE } from '../http-headers';
/**
 * @typedef {module:http.HTTPInit} module:http.ContentTypeInit
 * @property {string | module:core.MediaType} [contentType] The `Content-Type` to append to request headers
 */
/**
 * @implements module:http.InitializationAwareHTTPInterceptor
 */
export class ContentTypeInterceptor {
    /**
     * If the `contentType` setting exists, it inserts the value as an HTTP request header.
     * @param {URL} url The requested URL.
     * @param {module:http.ContentTypeInit} settings The HTTP request settings, including the `contentType` setting.
     * @returns {boolean} Whether or not the http request should continue execution.
     */
    preInit(url, settings) {
        if ('contentType' in settings) {
            const { contentType } = settings, headers = new Headers(settings.headers ?? {});
            CONTENT_TYPE.set(headers, typeof contentType === 'string' ? contentType : contentType.toString());
            settings.headers = headers;
        }
        return true;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC10eXBlLWludGVyY2VwdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVyY2VwdG9ycy9jb250ZW50LXR5cGUtaW50ZXJjZXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFJSCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFJL0M7OztHQUdHO0FBRUg7O0dBRUc7QUFDSCxNQUFNLE9BQU8sc0JBQXNCO0lBQy9COzs7OztPQUtHO0lBQ0gsT0FBTyxDQUFDLEdBQVEsRUFBRSxRQUF5QjtRQUN2QyxJQUFJLGFBQWEsSUFBSSxRQUFRLEVBQUUsQ0FBQztZQUM1QixNQUFNLEVBQUUsV0FBVyxFQUFFLEdBQUcsUUFBUSxFQUM1QixPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUMsQ0FBQztZQUNsRCxZQUFZLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxPQUFPLFdBQVcsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDbEcsUUFBUSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7UUFDL0IsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7Q0FDSiJ9