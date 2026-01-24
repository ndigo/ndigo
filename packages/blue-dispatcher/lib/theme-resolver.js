/**
 * @author Jeff Rose
 */
/**
 * @interface module:dispatcher.ThemeResolver
 */
/**
 * @function module:dispatcher.ThemeResolver#resolveTheme
 * @param {module:dispatcher.Route} route
 * @returns {external:string} The theme name
 */
const { defineProperty } = Reflect;
export class AbstractThemeResolver {
    defaultThemeName;
    get [Symbol.toStringTag]() {
        return 'ThemeResolver';
    }
    constructor(defaultThemeName) {
        defineProperty(this, 'defaultThemeName', {
            value: defaultThemeName,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
}
/**
 * @abstract
 * @class module:dispatcher.AbstractThemeResolver
 * @implements {module:dispatcher.ThemeResolver}
 */
/**
 * @member {external:string} module:dispatcher.AbstractThemeResolver#defaultThemeName
 */
/**
 * @abstract
 * @function module:dispatcher.AbstractThemeResolver#resolveTheme
 * @param {module:dispatcher.Route} route
 * @returns {external:string} The theme name
 */
/**
 * @class module:dispatcher.FixedThemeResolver
 * @extends {module:dispatcher.AbstractThemeResolver}
 */
export class FixedThemeResolver extends AbstractThemeResolver {
    resolveTheme(route) {
        return this.defaultThemeName;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWUtcmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdGhlbWUtcmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFRSDs7R0FFRztBQUVIOzs7O0dBSUc7QUFFSCxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxDQUFDO0FBRW5DLE1BQU0sT0FBZ0IscUJBQXFCO0lBQzlCLGdCQUFnQixDQUFTO0lBRWxDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3BCLE9BQU8sZUFBZSxDQUFDO0lBQzNCLENBQUM7SUFFRCxZQUFZLGdCQUF3QjtRQUNoQyxjQUFjLENBQUMsSUFBSSxFQUFFLGtCQUFrQixFQUFFO1lBQ3JDLEtBQUssRUFBRSxnQkFBZ0I7WUFDdkIsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUdKO0FBRUQ7Ozs7R0FJRztBQUVIOztHQUVHO0FBRUg7Ozs7O0dBS0c7QUFFSDs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sa0JBQW1CLFNBQVEscUJBQXFCO0lBQ3pELFlBQVksQ0FBQyxLQUFZO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDO0lBQ2pDLENBQUM7Q0FDSiJ9