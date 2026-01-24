/**
 * @author Jeff Rose
 */
/**
 * @class module:router.RouterExecutionChain
 * @implements module:core.Serializable
 */
export default class RouterExecutionChain {
    #interceptors;
    interceptorIndex;
    get [Symbol.toStringTag]() {
        return 'RouterExecutionChain';
    }
    get interceptors() {
        return this.#interceptors;
    }
    constructor(chain = null) {
        this.#interceptors = null;
        if (chain instanceof RouterExecutionChain) {
            chain && this.addInterceptors(chain.interceptors);
        }
        else {
            chain && this.addInterceptors(chain);
        }
        this.interceptorIndex = -1;
    }
    /**
     * @function module:router.RouterExecutionChain#addInterceptor
     * @param {module:router.RouterInterceptor} interceptor
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
     * @function module:router.RouterExecutionChain#addInterceptors
     * @param {external:Array<module:router.RouterInterceptor>} interceptors
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
     * @function module:router.RouterExecutionChain#applyPostRoute
     * @param {module:router.Route} route
     */
    applyPostRoute(route) {
        const interceptors = this.#interceptors, length = interceptors.length;
        if (length) {
            let index = 0;
            for (; index < length; index++) {
                interceptors[index].postRoute(route);
            }
        }
    }
    /**
     * @function module:router.RouterExecutionChain#applyPreRoute
     * @param {module:router.Route} route
     */
    applyPreRoute(route) {
        const interceptors = this.#interceptors, length = interceptors.length;
        if (length) {
            let index = 0;
            for (; index < length; index++) {
                if (interceptors[index].preRoute(route) === false) {
                    return false;
                }
                this.interceptorIndex = index;
            }
        }
        return true;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLWV4ZWN1dGlvbi1jaGFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9yb3V0ZXItZXhlY3V0aW9uLWNoYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBS0g7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE9BQU8sT0FBTyxvQkFBb0I7SUFDckMsYUFBYSxDQUFzQjtJQUVuQyxnQkFBZ0IsQ0FBUztJQUV6QixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUNwQixPQUFPLHNCQUFzQixDQUFDO0lBQ2xDLENBQUM7SUFFRCxJQUFJLFlBQVk7UUFDWixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUM7SUFDOUIsQ0FBQztJQUVELFlBQVksUUFBb0QsSUFBSTtRQUNoRSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQztRQUUxQixJQUFJLEtBQUssWUFBWSxvQkFBb0IsRUFBRSxDQUFDO1lBQ3hDLEtBQUssSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN0RCxDQUFDO2FBQU0sQ0FBQztZQUNKLEtBQUssSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pDLENBQUM7UUFFRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVEOzs7T0FHRztJQUNILGNBQWMsQ0FBQyxXQUE4QjtRQUN6QyxJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDdEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7WUFDNUIsQ0FBQztZQUNELElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7SUFDTCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsZUFBZSxDQUFDLFlBQWlDO1FBQzdDLE1BQU0sTUFBTSxHQUFHLFlBQVksRUFBRSxNQUFNLENBQUM7UUFDcEMsSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUNULEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztnQkFDMUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUM3QyxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFDSCxjQUFjLENBQUMsS0FBWTtRQUN2QixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsYUFBYSxFQUNuQyxNQUFNLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQztRQUNqQyxJQUFJLE1BQU0sRUFBRSxDQUFDO1lBQ1QsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsT0FBTyxLQUFLLEdBQUcsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUM7Z0JBQzdCLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDekMsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQ7OztPQUdHO0lBQ0gsYUFBYSxDQUFDLEtBQVk7UUFDdEIsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFDbkMsTUFBTSxHQUFHLFlBQVksQ0FBQyxNQUFNLENBQUM7UUFDakMsSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUNULElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztZQUNkLE9BQU8sS0FBSyxHQUFHLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO2dCQUM3QixJQUFJLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEtBQUssS0FBSyxFQUFFLENBQUM7b0JBQ2hELE9BQU8sS0FBSyxDQUFDO2dCQUNqQixDQUFDO2dCQUNELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxLQUFLLENBQUM7WUFDbEMsQ0FBQztRQUNMLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBQ0oifQ==