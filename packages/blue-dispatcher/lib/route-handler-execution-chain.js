/**
 * @author Jeff Rose
 */
/**
 * @class module:dispatcher.RouteHandlerExecutionChain
 */
export default class RouteHandlerExecutionChain {
    #interceptors;
    handler;
    interceptorIndex;
    get [Symbol.toStringTag]() {
        return 'HandlerExecutionChain';
    }
    get interceptors() {
        return this.#interceptors;
    }
    constructor(handler, interceptors = null) {
        this.#interceptors = null;
        if (handler instanceof RouteHandlerExecutionChain) {
            const chain = handler;
            this.handler = chain.handler;
            interceptors && this.addInterceptors(chain.interceptors);
        }
        else {
            this.handler = handler;
            interceptors && this.addInterceptors(interceptors);
        }
        this.interceptorIndex = -1;
    }
    /**
     * @function module:dispatcher.RouteHandlerExecutionChain#addInterceptor
     * @param {module:router.RouteHandlerInterceptor} interceptor
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
     * @function module:dispatcher.RouteHandlerExecutionChain#addInterceptors
     * @param {external:Array<module:router.RouteHandlerInterceptor>} interceptors
     */
    addInterceptors(interceptors) {
        const length = interceptors?.length;
        if (length) {
            for (let index = 0; index < length; index++) {
                this.addInterceptor(interceptors[index]);
            }
        }
    }
    /**
     * @function module:dispatcher.RouteHandlerExecutionChain#applyPostHandle
     * @param {module:router.Route} route
     * @param {module:dispatcher.ModelAndView} mv
     */
    applyPostHandle(route, mv) {
        const interceptors = this.#interceptors, length = interceptors?.length;
        let index = 0;
        if (length) {
            for (; index < length; index++) {
                interceptors[index].postHandle(route, this.handler, mv);
            }
        }
    }
    /**
     * @function module:dispatcher.RouteHandlerExecutionChain#applyPreHandle
     * @param {module:router.Route} route
     */
    applyPreHandle(route) {
        const interceptors = this.#interceptors, length = interceptors?.length;
        let index = 0;
        if (length) {
            for (; index < length; index++) {
                if (interceptors[index].preHandle(route, this.handler) === false) {
                    return false;
                }
                this.interceptorIndex = index;
            }
        }
        return true;
    }
    /**
     * @function module:dispatcher.RouteHandlerExecutionChain#triggerCompleteHandle
     * @param {module:router.Route} route
     * @param {external:Error} error
     */
    triggerCompleteHandle(route, error = null) {
        const interceptors = this.#interceptors, length = interceptors?.length;
        let index = 0;
        if (length) {
            for (; index < length; index++) {
                try {
                    interceptors[index].completeHandle(route, this.handler, error);
                }
                catch (e) {
                    // Handle this
                }
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtaGFuZGxlci1leGVjdXRpb24tY2hhaW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcm91dGUtaGFuZGxlci1leGVjdXRpb24tY2hhaW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFNSDs7R0FFRztBQUNILE1BQU0sQ0FBQyxPQUFPLE9BQU8sMEJBQTBCO0lBQzNDLGFBQWEsQ0FBNEI7SUFFekMsT0FBTyxDQUFTO0lBQ2hCLGdCQUFnQixDQUFTO0lBRXpCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3BCLE9BQU8sdUJBQXVCLENBQUM7SUFDbkMsQ0FBQztJQUVELElBQUksWUFBWTtRQUNaLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM5QixDQUFDO0lBRUQsWUFBWSxPQUE0QyxFQUFFLGVBQTBDLElBQUk7UUFDcEcsSUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLENBQUM7UUFFMUIsSUFBSSxPQUFPLFlBQVksMEJBQTBCLEVBQUUsQ0FBQztZQUNoRCxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUM7WUFDdEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO1lBQzdCLFlBQVksSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM3RCxDQUFDO2FBQU0sQ0FBQztZQUNKLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1lBQ3ZCLFlBQVksSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFFRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVEOzs7T0FHRztJQUNILGNBQWMsQ0FBQyxXQUFvQztRQUMvQyxJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDdEIs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