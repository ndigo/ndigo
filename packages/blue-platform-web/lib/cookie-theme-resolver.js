/**
 * @author Jeff Rose
 */
import { AbstractThemeResolver } from '@blue/dispatcher';
import Cookies from './cookies';
/**
 * @extends module:dispatcher.AbstractThemeResolver
 */
export class CookieThemeResolver extends AbstractThemeResolver {
    cookieName;
    get [Symbol.toStringTag]() {
        return `CookieThemeResolver:${this.cookieName}`;
    }
    constructor(cookieName, defaultThemeName) {
        super(defaultThemeName);
        /**
         */
        Reflect.defineProperty(this, 'cookieName', {
            value: cookieName,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
    resolveTheme(route) {
        // @ts-ignore: ¯\_(ツ)_/¯
        const themeName = Cookies.get(this.cookieName) || this.defaultThemeName;
        return themeName;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29va2llLXRoZW1lLXJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2Nvb2tpZS10aGVtZS1yZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRXpELE9BQU8sT0FBTyxNQUFNLFdBQVcsQ0FBQztBQUVoQzs7R0FFRztBQUNILE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxxQkFBcUI7SUFDakQsVUFBVSxDQUFTO0lBRTVCLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3BCLE9BQU8sdUJBQXVCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztJQUNwRCxDQUFDO0lBRUQsWUFBWSxVQUFrQixFQUFFLGdCQUF3QjtRQUNwRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUN4QjtXQUNHO1FBQ0gsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ3ZDLEtBQUssRUFBRSxVQUFVO1lBQ2pCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxZQUFZLENBQUMsS0FBWTtRQUNyQix3QkFBd0I7UUFDeEIsTUFBTSxTQUFTLEdBQVksT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFZLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDO1FBQzVGLE9BQU8sU0FBUyxDQUFDO0lBQ3JCLENBQUM7Q0FDSiJ9