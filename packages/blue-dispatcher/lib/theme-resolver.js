/**
 * @author Jeff Rose
 */
/**
 */
/**
 * @param {module:dispatcher.Route} route
 * @returns {string} The theme name
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
 * @implements {module:dispatcher.ThemeResolver}
 */
/**
 */
/**
 * @abstract
 * @param {module:dispatcher.Route} route
 * @returns {string} The theme name
 */
/**
 * @extends {module:dispatcher.AbstractThemeResolver}
 */
export class FixedThemeResolver extends AbstractThemeResolver {
    resolveTheme(route) {
        return this.defaultThemeName;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGhlbWUtcmVzb2x2ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdGhlbWUtcmVzb2x2ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFRSDtHQUNHO0FBRUg7OztHQUdHO0FBRUgsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sQ0FBQztBQUVuQyxNQUFNLE9BQWdCLHFCQUFxQjtJQUM5QixnQkFBZ0IsQ0FBUztJQUVsQyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUNwQixPQUFPLGVBQWUsQ0FBQztJQUMzQixDQUFDO0lBRUQsWUFBWSxnQkFBd0I7UUFDaEMsY0FBYyxDQUFDLElBQUksRUFBRSxrQkFBa0IsRUFBRTtZQUNyQyxLQUFLLEVBQUUsZ0JBQWdCO1lBQ3ZCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FHSjtBQUVEOzs7R0FHRztBQUVIO0dBQ0c7QUFFSDs7OztHQUlHO0FBRUg7O0dBRUc7QUFDSCxNQUFNLE9BQU8sa0JBQW1CLFNBQVEscUJBQXFCO0lBQ3pELFlBQVksQ0FBQyxLQUFZO1FBQ3JCLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDO0lBQ2pDLENBQUM7Q0FDSiJ9