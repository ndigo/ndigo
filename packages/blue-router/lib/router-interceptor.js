import { AsPathMatcherFilter, Null } from '@blue/core';
/**
 * @class module:router.MappedRouterInterceptor
 * @implements module:router.RouterInterceptor
 */
export class MappedRouterInterceptor extends AsPathMatcherFilter(Null) {
    #interceptor;
    pathMatcher;
    get interceptor() {
        return this.#interceptor;
    }
    constructor(interceptor, includePatterns, excludePatterns) {
        super();
        this.#interceptor = interceptor;
        // TODO TYPESCRIPT DOESN'T LIKE THIS FOR SOME REASON
        //this.setExcludePatterns( excludePatterns );
        //this.setIncludePatterns( includePatterns );
    }
    postRoute(route) {
        this.#interceptor.postRoute(route);
    }
    preRoute(route) {
        return this.#interceptor.preRoute(route);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLWludGVyY2VwdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3JvdXRlci1pbnRlcmNlcHRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQWUsbUJBQW1CLEVBQUUsSUFBSSxFQUFxQixNQUFNLFlBQVksQ0FBQztBQXlCdkY7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLHVCQUF3QixTQUFRLG1CQUFtQixDQUFDLElBQUksQ0FBQztJQUNsRSxZQUFZLENBQW9CO0lBRWhDLFdBQVcsQ0FBYztJQUV6QixJQUFJLFdBQVc7UUFDWCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDN0IsQ0FBQztJQUVELFlBQVksV0FBOEIsRUFBRSxlQUF5QixFQUFFLGVBQTBCO1FBQzdGLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7UUFDaEMsb0RBQW9EO1FBQ3BELDZDQUE2QztRQUM3Qyw2Q0FBNkM7SUFDakQsQ0FBQztJQUVELFNBQVMsQ0FBQyxLQUFZO1FBQ2xCLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFRCxRQUFRLENBQUMsS0FBWTtRQUNqQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzdDLENBQUM7Q0FDSiJ9