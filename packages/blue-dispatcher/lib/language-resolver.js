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
 * @interface module:dispatcher.LanguageResolver
 */
/**
 * @function module:dispatcher.LanguageResolver#resolveLanguage
 */
/**
 * @abstract
 * @class module:dispatcher.AbstractLanguageResolver
 * @implements {module:dispatcher.LanguageResolver}
 */
/**
 * @class module:dispatcher.NavigatorLanguageResolver
 * @extends {module:dispatcher.AbstractLanguageResolver}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/NavigatorLanguage}
 */
export class NavigatorLanguageResolver extends AbstractLanguageResolver {
    get [Symbol.toStringTag]() {
        return 'NavigatorLanguageResolver';
    }
    /**
     * @function module:dispatcher.resolveLanguage
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFuZ3VhZ2UtcmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbGFuZ3VhZ2UtcmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBU0EsTUFBTSxPQUFnQix3QkFBd0I7SUFDakMsZUFBZSxDQUFTO0lBRWpDLFlBQVksZUFBdUI7UUFDL0IsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsaUJBQWlCLEVBQUU7WUFDNUMsS0FBSyxFQUFFLGVBQWU7WUFDdEIsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUdKO0FBRUQ7O0dBRUc7QUFFSDs7R0FFRztBQUVIOzs7O0dBSUc7QUFFSDs7OztHQUlHO0FBQ0gsTUFBTSxPQUFPLHlCQUEwQixTQUFRLHdCQUF3QjtJQUNuRSxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUNwQixPQUFPLDJCQUEyQixDQUFDO0lBQ3ZDLENBQUM7SUFFRDs7O09BR0c7SUFDSCxlQUFlLENBQUMsS0FBWTtRQUN4QixJQUFJLElBQVksQ0FBQztRQUVqQixJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQ1osSUFBSSxTQUFTLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ3JCLElBQUksR0FBRyxTQUFTLENBQUMsUUFBUSxDQUFDO1lBQzlCLENBQUM7aUJBQU0sSUFBSSxTQUFTLENBQUMsU0FBUyxJQUFJLFNBQVMsQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7Z0JBQzNELElBQUksR0FBRyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ2xDLENBQUM7UUFDTCxDQUFDO2FBQU0sQ0FBQztZQUNKLElBQUksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO1FBQ2hDLENBQUM7UUFFRCx5RUFBeUU7UUFDekUsK0dBQStHO1FBRS9HLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7Q0FDSjtBQUVEOzs7R0FHRyJ9