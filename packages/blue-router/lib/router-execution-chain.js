/**
 * @author Jeff Rose
 */
/**
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
     * @param {Array<module:router.RouterInterceptor>} interceptors
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLWV4ZWN1dGlvbi1jaGFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9yb3V0ZXItZXhlY3V0aW9uLWNoYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBS0g7O0dBRUc7QUFDSCxNQUFNLENBQUMsT0FBTyxPQUFPLG9CQUFvQjtJQUNyQyxhQUFhLENBQXNCO0lBRW5DLGdCQUFnQixDQUFTO0lBRXpCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3BCLE9BQU8sc0JBQXNCLENBQUM7SUFDbEMsQ0FBQztJQUVELElBQUksWUFBWTtRQUNaLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM5QixDQUFDO0lBRUQsWUFBWSxRQUFvRCxJQUFJO1FBQ2hFLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDO1FBRTFCLElBQUksS0FBSyxZQUFZLG9CQUFvQixFQUFFLENBQUM7WUFDeEMsS0FBSyxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3RELENBQUM7YUFBTSxDQUFDO1lBQ0osS0FBSyxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekMsQ0FBQztRQUVELElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBRUQ7O09BRUc7SUFDSCxjQUFjLENBQUMsV0FBOEI7UUFDekMsSUFBSSxXQUFXLEVBQUUsQ0FBQztZQUNkLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3RCLElBQUksQ0FBQyxhQUFhLEdBQUcsRUFBRSxDQUFDO1lBQzVCLENBQUM7WUFDRCxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN6QyxDQUFDO0lBQ0wsQ0FBQztJQUVEOztPQUVHO0lBQ0gsZUFBZSxDQUFDLFlBQWlDO1FBQzdDLE1BQU0sTUFBTSxHQUFHLFlBQVksRUFBRSxNQUFNLENBQUM7UUFDcEMsSUFBSSxNQUFNLEVBQUUsQ0FBQztZQUNULEtBQUssSUFBSSxLQUFLLEdBQUcsQ0FBQyxFQUFFLEtBQUssR0FBRyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztnQkFDMUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztZQUM3QyxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNILGNBQWMsQ0FBQyxLQUFZO1FBQ3ZCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQ25DLE1BQU0sR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDO1FBQ2pDLElBQUksTUFBTSxFQUFFLENBQUM7WUFDVCxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDZCxPQUFPLEtBQUssR0FBRyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztnQkFDN0IsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN6QyxDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNILGFBQWEsQ0FBQyxLQUFZO1FBQ3RCLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxhQUFhLEVBQ25DLE1BQU0sR0FBRyxZQUFZLENBQUMsTUFBTSxDQUFDO1FBQ2pDLElBQUksTUFBTSxFQUFFLENBQUM7WUFDVCxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7WUFDZCxPQUFPLEtBQUssR0FBRyxNQUFNLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQztnQkFDN0IsSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLEtBQUssRUFBRSxDQUFDO29CQUNoRCxPQUFPLEtBQUssQ0FBQztnQkFDakIsQ0FBQztnQkFDRCxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO1lBQ2xDLENBQUM7UUFDTCxDQUFDO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztDQUNKIn0=