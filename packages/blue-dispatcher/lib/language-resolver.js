export class AbstractLanguageResolver {
    defaultLanguage;
    constructor(defaultLanguage) {
        Reflect.defineProperty(this, 'defaultLanguage', {
            value: defaultLanguage,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
}
/**
 */
/**
 */
/**
 * @abstract
 * @implements {module:dispatcher.LanguageResolver}
 */
/**
 * @extends {module:dispatcher.AbstractLanguageResolver}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/NavigatorLanguage}
 */
export class NavigatorLanguageResolver extends AbstractLanguageResolver {
    get [Symbol.toStringTag]() {
        return 'NavigatorLanguageResolver';
    }
    /**
     * @param {module:router.Route} route
     */
    resolveLanguage(route) {
        let lang;
        if (navigator) {
            if (navigator.language) {
                lang = navigator.language;
            }
            else if (navigator.languages && navigator.languages.length) {
                lang = navigator.languages[0];
            }
        }
        else {
            lang = this.defaultLanguage;
        }
        // * I think this is the Optional Chaining equivalent to the logic above.
        //lang = navigator?.language || navigator?.languages?.length ? navigator.languages[ 0 ] : this.defaultLanguage;
        return lang;
    }
}
/**
 * * Developer Notes
 * ? How does CXO determine language/locale today? We should re-implement that logic as a LanguageResolver.
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2UtcmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbGFuZ3VhZ2UtcmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBU0EsTUFBTSxPQUFnQix3QkFBd0I7SUFDakMsZUFBZSxDQUFTO0lBRWpDLFlBQVksZUFBdUI7UUFDL0IsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUU7WUFDNUMsS0FBSyxFQUFFLGVBQWU7WUFDdEIsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUdKO0FBRUQ7R0FDRztBQUVIO0dBQ0c7QUFFSDs7O0dBR0c7QUFFSDs7O0dBR0c7QUFDSCxNQUFNLE9BQU8seUJBQTBCLFNBQVEsd0JBQXdCO0lBQ25FLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3BCLE9BQU8sMkJBQTJCLENBQUM7SUFDdkMsQ0FBQztJQUVEOztPQUVHO0lBQ0gsZUFBZSxDQUFDLEtBQVk7UUFDeEIsSUFBSSxJQUFZLENBQUM7UUFFakIsSUFBSSxTQUFTLEVBQUUsQ0FBQztZQUNaLElBQUksU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNyQixJQUFJLEdBQUcsU0FBUyxDQUFDLFFBQVEsQ0FBQztZQUM5QixDQUFDO2lCQUFNLElBQUksU0FBUyxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUMzRCxJQUFJLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsQyxDQUFDO1FBQ0wsQ0FBQzthQUFNLENBQUM7WUFDSixJQUFJLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUNoQyxDQUFDO1FBRUQseUVBQXlFO1FBQ3pFLCtHQUErRztRQUUvRyxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBQ0o7QUFFRDs7O0dBR0cifQ==