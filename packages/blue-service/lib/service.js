/**
 * @author Jeff Rose
 */
import { createNull } from '@blue/core';
import { DataParameterInterceptor, ContentTypeInterceptor, ResponseTypeInterceptor, TimeoutInterceptor, IfModifiedInterceptor, } from '@blue/http';
/**
 * @interface module:service.CompletionAwareServiceInterceptor
 */
/**
 * @function module:service.CompletionAwareServiceInterceptor#postRequest
 * @param {external:Request} request
 */
/**
 * @interface module:service.ErrorAwareServiceInterceptor
 */
/**
 * @function module:service.ErrorAwareServiceInterceptor#postFailure
 * @param {external:Error} error
 * @param {external:Request} request
 */
/**
 * @interface module:service.InitializationAwareServiceInterceptor
 */
/**
 * @function module:service.InitializationAwareServiceInterceptor#preInit
 * @param {external:URL} url
 * @param {module:service.ServiceInit} settings
 * @returns {external:boolean}
 */
/**
 * @interface module:service.RequestAwareServiceInterceptor
 */
/**
 * @function module:service.RequestAwareServiceInterceptor#preRequest
 * @param {external:Request} request
 * @returns {external:Promise<external:Request|void>}
 */
/**
 * @interface module:service.ResultAwareServiceInterceptor
 */
/**
 * @function module:service.ResultAwareServiceInterceptor#postSuccess
 * @param {module:http.HTTPResult} result
 * @param {module:service.ServiceInit} settings
 * @returns {external:Promise<void>}
 */
/**
 * @typedef {module:service.CompletionAwareServiceInterceptor|module:service.ErrorAwareServiceInterceptor|module:service.InitializationAwareServiceInterceptor|module:service.RequestAwareServiceInterceptor|module:service.ResultAwareServiceInterceptor} module:service.ServiceInterceptor
 */
const { defineProperty } = Reflect, defaults = {}, httpInterceptors = [
    new ContentTypeInterceptor(),
    new DataParameterInterceptor(),
    new ResponseTypeInterceptor(),
    new IfModifiedInterceptor(),
    new TimeoutInterceptor(5000),
];
let serviceId = 0;
/**
 * @function module:service~nextServiceId
 * @returns {external:number} The next service id
 */
function nextServiceId() {
    return ++serviceId;
}
export class MappedServiceInterceptor {
    #excludePatterns;
    #includePatterns;
    #interceptor;
    get interceptor() {
        return this.#interceptor;
    }
    constructor(interceptor, includePatterns, excludePatterns) {
        this.#interceptor = interceptor;
        this.setExcludePatterns(excludePatterns);
        this.setIncludePatterns(includePatterns);
    }
    matches(path, matcher) {
        return true;
    }
    setExcludePatterns(excludePatterns = []) {
        this.#excludePatterns = excludePatterns;
    }
    setIncludePatterns(includePatterns = []) {
        this.#includePatterns = includePatterns;
    }
}
/**
 * @class module:service.ServiceExecutionChain
 */
class ServiceExecutionChain {
    #interceptors;
    service;
    interceptorIndex;
    get [Symbol.toStringTag]() {
        return 'ServiceExecutionChain';
    }
    get interceptors() {
        return this.#interceptors;
    }
    constructor(service, interceptors = null) {
        this.#interceptors = null;
        if (service instanceof ServiceExecutionChain) {
            const chain = service;
            this.service = chain.service;
            interceptors && this.addInterceptors(chain.interceptors);
        }
        else {
            this.service = service;
            interceptors && this.addInterceptors(interceptors);
        }
        this.interceptorIndex = -1;
    }
    /**
     * @function module:service.ServiceExecutionChain#addInterceptor
     * @param {module:service.ServiceInterceptor} interceptor
     */
    addInterceptor(interceptor) {
        if (interceptor) {
            if (!this.#interceptors) {
                this.#interceptors = [];
            }
            this.#interceptors.push(interceptor);
        }
    }
    /**
     * @function module:service.ServiceExecutionChain#addInterceptors
     * @param {external:Array<module:service.ServiceInterceptor>} interceptors
     */
    addInterceptors(interceptors) {
        const length = interceptors?.length;
        if (length) {
            for (let index = 0; index < length; index++) {
                this.addInterceptor(interceptors[index]);
            }
        }
    }
}
class Service {
    #interceptors;
    #serviceCalls;
    id;
    name;
    destroyed;
    get [Symbol.toStringTag]() {
        return `Service:${this.name}`;
    }
    set serviceCalls(newServiceCalls) { }
    constructor(name, init) {
        this.#serviceCalls = createNull();
        defineProperty(this, 'name', {
            value: name,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'id', {
            value: nextServiceId(),
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
    destroy() {
        throw new Error('Method not implemented.');
    }
    addServiceCall(name, settings) {
        this.#serviceCalls[name] = createNull();
        this[name] = (data, init) => {
            /*const
                settings = Object.assign( {}, defaults, init ),
                chain = this._getServiceExecutionChain( this, input ),
                url = new URL( input );
*/
        };
    }
    _getServiceExecutionChain(service, url) {
        const chain = service instanceof ServiceExecutionChain ? service : new ServiceExecutionChain(service), interceptors = this.#interceptors, length = interceptors?.length;
        if (length) {
            for (let index = 0; index < length; index++) {
                const interceptor = interceptors[index];
                if (interceptor instanceof MappedServiceInterceptor) {
                    if (interceptor.matches(url)) {
                        chain.addInterceptor(interceptor.interceptor);
                    }
                }
                else {
                    chain.addInterceptor(interceptor);
                }
            }
        }
        return chain;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBQ0gsT0FBTyxFQUFFLFVBQVUsRUFBYSxNQUFNLFlBQVksQ0FBQztBQUVuRCxPQUFPLEVBUUgsd0JBQXdCLEVBQ3hCLHNCQUFzQixFQUN0Qix1QkFBdUIsRUFDdkIsa0JBQWtCLEVBQ2xCLHFCQUFxQixHQUN4QixNQUFNLFlBQVksQ0FBQztBQW9DcEI7O0dBRUc7QUFFSDs7O0dBR0c7QUFFSDs7R0FFRztBQUVIOzs7O0dBSUc7QUFFSDs7R0FFRztBQUVIOzs7OztHQUtHO0FBRUg7O0dBRUc7QUFFSDs7OztHQUlHO0FBRUg7O0dBRUc7QUFFSDs7Ozs7R0FLRztBQUVIOztHQUVHO0FBRUgsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDOUIsUUFBUSxHQUFHLEVBQUUsRUFDYixnQkFBZ0IsR0FBc0I7SUFDbEMsSUFBSSxzQkFBc0IsRUFBRTtJQUM1QixJQUFJLHdCQUF3QixFQUFFO0lBQzlCLElBQUksdUJBQXVCLEVBQUU7SUFDN0IsSUFBSSxxQkFBcUIsRUFBRTtJQUMzQixJQUFJLGtCQUFrQixDQUFDLElBQUksQ0FBQztDQUMvQixDQUFDO0FBRU4sSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBRWxCOzs7R0FHRztBQUNILFNBQVMsYUFBYTtJQUNsQixPQUFPLEVBQUUsU0FBUyxDQUFDO0FBQ3ZCLENBQUM7QUFFRCxNQUFNLE9BQU8sd0JBQXdCO0lBQ2pDLGdCQUFnQixDQUFXO0lBQzNCLGdCQUFnQixDQUFXO0lBQzNCLFlBQVksQ0FBcUI7SUFFakMsSUFBSSxXQUFXO1FBQ1gsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQzdCLENBQUM7SUFFRCxZQUFZLFdBQStCLEVBQUUsZUFBeUIsRUFBRSxlQUEwQjtRQUM5RixJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztRQUNo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