/**
 * @author Jeff Rose
 */
import { CONTENT_TYPE } from '../http-headers';
/**
 * @typedef {module:http.HTTPInit} module:http.ContentTypeInit
 * @property {external:string | module:core.MediaType} [contentType] The `Content-Type` to append to request headers
 */
/**
 * @class module:http.ContentTypeInterceptor
 * @implements module:http.InitializationAwareHTTPInterceptor
 */
export class ContentTypeInterceptor {
    /**
     * If the `contentType` setting exists, it inserts the value as an HTTP request header.
     * @function module:http.ContentTypeInterceptor#preInit
     * @param {external:URL} url The requested URL.
     * @param {module:http.ContentTypeInit} settings The HTTP request settings, including the `contentType` setting.
     * @returns {external:boolean} Whether or not the http request should continue execution.
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC10eXBlLWludGVyY2VwdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2ludGVyY2VwdG9ycy9jb250ZW50LXR5cGUtaW50ZXJjZXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFJSCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFJL0M7OztHQUdHO0FBRUg7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLHNCQUFzQjtJQUMvQjs7Ozs7O09BTUc7SUFDSCxPQUFPLENBQUMsR0FBUSxFQUFFLFFBQXlCO1FBQ3ZDLElBQUksYUFBYSxJQUFJLFFBQVEsRUFBRSxDQUFDO1lBQzVCLE1BQU0sRUFBRSxXQUFXLEVBQUUsR0FBRyxRQUFRLEVBQzVCLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBQ2xELFlBQVksQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE9BQU8sV0FBVyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztZQUNsRyxRQUFRLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUMvQixDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKIn0=