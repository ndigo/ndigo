/**
 * @author Jeff Rose
 */
import { createNull } from '@blue/core';
import { DataParameterInterceptor, ContentTypeInterceptor, ResponseTypeInterceptor, TimeoutInterceptor, IfModifiedInterceptor, } from '@blue/http';
/**
 */
/**
 * @param {Request} request
 */
/**
 */
/**
 * @param {Error} error
 * @param {Request} request
 */
/**
 */
/**
 * @param {URL} url
 * @param {module:service.ServiceInit} settings
 * @returns {boolean}
 */
/**
 */
/**
 * @param {Request} request
 * @returns {Promise<external:Request|void>}
 */
/**
 */
/**
 * @param {module:http.HTTPResult} result
 * @param {module:service.ServiceInit} settings
 * @returns {Promise<void>}
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
 * @returns {number} The next service id
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
     * @param {Array<module:service.ServiceInterceptor>} interceptors
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBQ0gsT0FBTyxFQUFFLFVBQVUsRUFBYSxNQUFNLFlBQVksQ0FBQztBQUVuRCxPQUFPLEVBUUgsd0JBQXdCLEVBQ3hCLHNCQUFzQixFQUN0Qix1QkFBdUIsRUFDdkIsa0JBQWtCLEVBQ2xCLHFCQUFxQixHQUN4QixNQUFNLFlBQVksQ0FBQztBQW9DcEI7R0FDRztBQUVIOztHQUVHO0FBRUg7R0FDRztBQUVIOzs7R0FHRztBQUVIO0dBQ0c7QUFFSDs7OztHQUlHO0FBRUg7R0FDRztBQUVIOzs7R0FHRztBQUVIO0dBQ0c7QUFFSDs7OztHQUlHO0FBRUg7O0dBRUc7QUFFSCxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM5QixRQUFRLEdBQUcsRUFBRSxFQUNiLGdCQUFnQixHQUFzQjtJQUNsQyxJQUFJLHNCQUFzQixFQUFFO0lBQzVCLElBQUksd0JBQXdCLEVBQUU7SUFDOUIsSUFBSSx1QkFBdUIsRUFBRTtJQUM3QixJQUFJLHFCQUFxQixFQUFFO0lBQzNCLElBQUksa0JBQWtCLENBQUMsSUFBSSxDQUFDO0NBQy9CLENBQUM7QUFFTixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUM7QUFFbEI7O0dBRUc7QUFDSCxTQUFTLGFBQWE7SUFDbEIsT0FBTyxFQUFFLFNBQVMsQ0FBQztBQUN2QixDQUFDO0FBRUQsTUFBTSxPQUFPLHdCQUF3QjtJQUNqQyxnQkFBZ0IsQ0FBVztJQUMzQixnQkFBZ0IsQ0FBVztJQUMzQixZQUFZLENBQXFCO0lBRWpDLElBQUksV0FBVztRQUNYLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztJQUM3QixDQUFDO0lBRUQsWUFBWSxXQUErQixFQUFFLGVBQXlCLEVBQUUsZUFBMEI7UUFDOUYsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7UUFDaEMsSUFBSSxDQUFD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