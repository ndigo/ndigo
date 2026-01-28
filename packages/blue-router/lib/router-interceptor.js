import { AsPathMatcherFilter, Null } from '@blue/core';
/**
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLWludGVyY2VwdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3JvdXRlci1pbnRlcmNlcHRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQWUsbUJBQW1CLEVBQUUsSUFBSSxFQUFxQixNQUFNLFlBQVksQ0FBQztBQXNCdkY7O0dBRUc7QUFDSCxNQUFNLE9BQU8sdUJBQXdCLFNBQVEsbUJBQW1CLENBQUMsSUFBSSxDQUFDO0lBQ2xFLFlBQVksQ0FBb0I7SUFFaEMsV0FBVyxDQUFjO0lBRXpCLElBQUksV0FBVztRQUNYLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztJQUM3QixDQUFDO0lBRUQsWUFBWSxXQUE4QixFQUFFLGVBQXlCLEVBQUUsZUFBMEI7UUFDN0YsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztRQUNoQyxvREFBb0Q7UUFDcEQsNkNBQTZDO1FBQzdDLDZDQUE2QztJQUNqRCxDQUFDO0lBRUQsU0FBUyxDQUFDLEtBQVk7UUFDbEIsSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVELFFBQVEsQ0FBQyxLQUFZO1FBQ2pCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDN0MsQ0FBQztDQUNKIn0=