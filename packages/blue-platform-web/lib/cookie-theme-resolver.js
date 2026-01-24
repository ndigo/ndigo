/**
 * @author Jeff Rose
 */
import { AbstractThemeResolver } from '@blue/dispatcher';
import Cookies from './cookies';
/**
 * @class module:dispatcher.CookieThemeResolver
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
         * @member {external:string} module:dispatcher.CookieThemeResolver#cookieName
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29va2llLXRoZW1lLXJlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2Nvb2tpZS10aGVtZS1yZXNvbHZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRXpELE9BQU8sT0FBTyxNQUFNLFdBQVcsQ0FBQztBQUVoQzs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sbUJBQW9CLFNBQVEscUJBQXFCO0lBQ2pELFVBQVUsQ0FBUztJQUU1QixJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUNwQixPQUFPLHVCQUF1QixJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7SUFDcEQsQ0FBQztJQUVELFlBQVksVUFBa0IsRUFBRSxnQkFBd0I7UUFDcEQsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDeEI7O1dBRUc7UUFDSCxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7WUFDdkMsS0FBSyxFQUFFLFVBQVU7WUFDakIsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELFlBQVksQ0FBQyxLQUFZO1FBQ3JCLHdCQUF3QjtRQUN4QixNQUFNLFNBQVMsR0FBWSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQVksSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUM7UUFDNUYsT0FBTyxTQUFTLENBQUM7SUFDckIsQ0FBQztDQUNKIn0=