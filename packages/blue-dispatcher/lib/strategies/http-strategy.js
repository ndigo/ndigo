/**
 * @author Jeff Rose
 */
import { ContentTypeInterceptor, DataParameterInterceptor, ResponseTypeInterceptor, HTTP, IfModifiedInterceptor, TimeoutInterceptor, } from '@blue/http';
/**
 */
/**
 */
/**
 */
/**
 * @param {module:context.ApplicationContext} context
 */
/**
 * @param {fetch} [fetch]
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC1zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zdHJhdGVnaWVzL2h0dHAtc3RyYXRlZ3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFJSCxPQUFPLEVBQ0gsc0JBQXNCLEVBQ3RCLHdCQUF3QixFQUN4Qix1QkFBdUIsRUFFdkIsSUFBSSxFQUVKLHFCQUFxQixFQUNyQixrQkFBa0IsR0FFckIsTUFBTSxZQUFZLENBQUM7QUFVcEI7R0FDRztBQUVIO0dBQ0c7QUFFSDtHQUNHO0FBRUg7O0dBRUc7QUFFSDs7O0dBR0c7QUFFSCxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM5QixnQkFBZ0IsR0FBRyxpQkFBaUIsRUFDcEMsaUJBQWlCLEdBQUcsR0FBRyxnQkFBZ0IsR0FBRyxFQUMxQyxhQUFhLEdBQUcsY0FBYyxFQUM5Qix1QkFBdUIsR0FBc0I7SUFDekMsSUFBSSxzQkFBc0IsRUFBRTtJQUM1QixJQUFJLHdCQUF3QixFQUFFO0lBQzlCLElBQUksdUJBQXVCLEVBQUU7SUFDN0IsSUFBSSxxQkFBcUIsRUFBRTtJQUMzQixJQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQztDQUMvQixFQUNELG1CQUFtQixHQUFhLEVBQUUsQ0FBQztBQUV2QyxNQUFNLENBQUMsTUFBTSxjQUFjLEdBQUcsQ0FDMUIsVUFBYSxFQUNrQixFQUFFLENBQ2pDLEtBQU0sU0FBUSxVQUFVO0lBQ1gsa0JBQWtCLENBQVM7SUFDM0IsNEJBQTRCLENBQVM7SUFDckMsZUFBZSxDQUFTO0lBRWpDLGdCQUFnQixDQUFvQjtJQUNwQyxZQUFZLENBQVc7SUFFdkIsWUFBWSxHQUFHLElBQVc7UUFDdEIsS0FBSyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDZixjQUFjLENBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFO1lBQ3ZDLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxnQkFBZ0I7WUFDM0IsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDO1FBQ0gsY0FBYyxDQUFDLElBQUksRUFBRSw4QkFBOEIsRUFBRTtZQUNqRCxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsaUJBQWlCO1lBQzVCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxJQUFJO1NBQ25CLENBQUMsQ0FBQztRQUNILGNBQWMsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUU7WUFDcEMsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLGFBQWE7WUFDeEIsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLElBQUk7U0FDbkIsQ0FBQyxDQUFDO1FBQ0gsSUFBSSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFFRCxRQUFRLENBQUMsT0FBMkI7UUFDaEMsTUFBTSxFQUFFLGtCQUFrQixFQUFFLDRCQUE0QixFQUFFLGVBQWUsRUFBRSxHQUFHLElBQUksQ0FBQztRQUNuRixJQUFJLENBQUMsc0JBQXNCLENBQ3ZCLE9BQU8sRUFDUCw0QkFBNEIsRUFDNUIsa0JBQWtCLEVBQ2xCLGlCQUFpQixFQUNqQix1QkFBdUIsQ0FDMUIsQ0FBQztRQUNGLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLGVBQWUsRUFBRSxhQUFhLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztJQUNwRixDQUFDO0lBRUQsT0FBTyxDQUFDLFFBQWUsVUFBVSxDQUFDLEtBQUs7UUFDbkMsTUFBTSxFQUFFLGdCQUFnQixFQUFFLFlBQVksRUFBRSxHQUFHLElBQUksQ0FBQztRQUNoRCxPQUFPLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMzRCxDQUFDO0NBQ0osQ0FBQyJ9