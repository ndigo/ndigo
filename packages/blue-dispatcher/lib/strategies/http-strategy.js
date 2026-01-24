/**
 * @author Jeff Rose
 */
import { ContentTypeInterceptor, DataParameterInterceptor, ResponseTypeInterceptor, HTTP, IfModifiedInterceptor, TimeoutInterceptor, } from '@blue/http';
/**
 * @interface module:dispatcher.HTTPStrategy
 */
/**
 * @member {external:Array<module:http.HTTPInterceptor>} module:dispatcher.HTTPStrategy#httpInterceptors
 */
/**
 * @member {module:http.HTTPInit} module:dispatcher.HTTPStrategy#httpSettings
 */
/**
 * @function module:dispatcher.HTTPStrategy#initHTTP
 * @param {module:context.ApplicationContext} context
 */
/**
 * @function module:dispatcher.HTTPStrategy#getHTTP
 * @param {external:fetch} [fetch]
 * @returns {module:http.HTTP}
 */
const { defineProperty } = Reflect, HTTP_INTERCEPTOR = 'httpInterceptor', HTTP_INTERCEPTORS = `${HTTP_INTERCEPTOR}s`, HTTP_SETTINGS = 'httpSettings', defaultHTTPInterceptors = [
    new ContentTypeInterceptor(),
    new DataParameterInterceptor(),
    new ResponseTypeInterceptor(),
    new IfModifiedInterceptor(),
    new TimeoutInterceptor(5000),
], defaultHTTPSettings = {};
export const AsHTTPStrategy = (superclass) => class extends superclass {
    httpInterceptorKey;
    httpInterceptorCollectionKey;
    httpSettingsKey;
    httpInterceptors;
    httpSettings;
    constructor(...args) {
        super(...args);
        defineProperty(this, 'httpInterceptorKey', {
            get: () => HTTP_INTERCEPTOR,
            configurable: true,
            enumerable: true,
        });
        defineProperty(this, 'httpInterceptorCollectionKey', {
            get: () => HTTP_INTERCEPTORS,
            configurable: true,
            enumerable: true,
        });
        defineProperty(this, 'httpSettingsKey', {
            get: () => HTTP_SETTINGS,
            configurable: true,
            enumerable: true,
        });
        this.addStrategy(HTTP_INTERCEPTORS);
    }
    initHTTP(context) {
        const { httpInterceptorKey, httpInterceptorCollectionKey, httpSettingsKey } = this;
        this.initCollectionStrategy(context, httpInterceptorCollectionKey, httpInterceptorKey, HTTP_INTERCEPTORS, defaultHTTPInterceptors);
        this.initStrategy(context, httpSettingsKey, HTTP_SETTINGS, defaultHTTPSettings);
    }
    getHTTP(fetch = globalThis.fetch) {
        const { httpInterceptors, httpSettings } = this;
        return new HTTP(httpInterceptors, httpSettings, fetch);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC1zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJhdGVnaWVzL2h0dHAtc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFJSCxPQUFPLEVBQ0gsc0JBQXNCLEVBQ3RCLHdCQUF3QixFQUN4Qix1QkFBdUIsRUFFdkIsSUFBSSxFQUVKLHFCQUFxQixFQUNyQixrQkFBa0IsR0FFckIsTUFBTSxZQUFZLENBQUM7QUFVcEI7O0dBRUc7QUFFSDs7R0FFRztBQUVIOztHQUVHO0FBRUg7OztHQUdHO0FBRUg7Ozs7R0FJRztBQUVILE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBQzlCLGdCQUFnQixHQUFHLGlCQUFpQixFQUNwQyxpQkFBaUIsR0FBRyxHQUFHLGdCQUFnQixHQUFHLEVBQzFDLGFBQWEsR0FBRyxjQUFjLEVBQzlCLHVCQUF1QixHQUFzQjtJQUN6QyxJQUFJLHNCQUFzQixFQUFFO0lBQzVCLElBQUksd0JBQXdCLEVBQUU7SUFDOUIsSUFBSSx1QkFBdUIsRUFBRTtJQUM3QixJQUFJLHFCQUFxQixFQUFFO0lBQzNCLElBQUksa0JBQWtCLENBQUMsSUFBSSxDQUFDO0NBQy9CLEVBQ0QsbUJBQW1CLEdBQWEsRUFBRSxDQUFDO0FBRXZDLE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxDQUMxQixVQUFhLEVBQ2tCLEVBQUUsQ0FDakMsS0FBTSxTQUFRLFVBQVU7SUFDWCxrQkFBa0IsQ0FBUztJQUMzQiw0QkFBNEIsQ0FBUztJQUNyQyxlQUFlLENBQVM7SUFFakMsZ0JBQWdCLENBQW9CO0lBQ3BDLFlBQVksQ0FBVztJQUV2QixZQUFZLEdBQUcsSUFBVztRQUN0QixLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNmLGNBQWMsQ0FBQyxJQUFJLEVBQUUsb0JBQW9CLEVBQUU7WUFDdkMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLGdCQUFnQjtZQUMzQixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsSUFBSTtTQUNuQixDQUFDLENBQUM7UUFDSCxjQUFjLENBQUMsSUFBSSxFQUFFLDhCQUE4QixFQUFFO1lBQ2pELEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxpQkFBaUI7WUFDNUIsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDO1FBQ0gsY0FBYyxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUNwQyxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsYUFBYTtZQUN4QixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsSUFBSTtTQUNuQixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsV0FBVyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUVELFFBQVEsQ0FBQyxPQUEyQjtRQUNoQyxNQUFNLEVBQUUsa0JBQWtCLEVBQUUsNEJBQTRCLEVBQUUsZUFBZSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ25GLElBQUksQ0FBQyxzQkFBc0IsQ0FDdkIsT0FBTyxFQUNQLDRCQUE0QixFQUM1QixrQkFBa0IsRUFDbEIsaUJBQWlCLEVBQ2pCLHVCQUF1QixDQUMxQixDQUFDO1FBQ0YsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsZUFBZSxFQUFFLGFBQWEsRUFBRSxtQkFBbUIsQ0FBQyxDQUFDO0lBQ3BGLENBQUM7SUFFRCxPQUFPLENBQUMsUUFBZSxVQUFVLENBQUMsS0FBSztRQUNuQyxNQUFNLEVBQUUsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLEdBQUcsSUFBSSxDQUFDO1FBQ2hELE9BQU8sSUFBSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzNELENBQUM7Q0FDSixDQUFDIn0=