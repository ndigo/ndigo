/**
 * @author Jeff Rose
 */
/**
 */
/**
 * @param {module:router.Route} route
 * @returns {string}
 */
const { defineProperty } = Reflect, slash = '/';
/**
 * @implements module:router.RouteToViewNameTranslator
 */
export class DefaultRouteToViewNameTranslator {
    prefix;
    separator;
    suffix;
    constructor() {
        defineProperty(this, 'prefix', {
            value: '',
            configurable: true,
            enumerable: false,
            writable: true,
        });
        defineProperty(this, 'separator', {
            value: slash,
            configurable: true,
            enumerable: false,
            writable: true,
        });
        defineProperty(this, 'suffix', {
            value: '',
            configurable: true,
            enumerable: false,
            writable: true,
        });
    }
    /**
     * @param {module:router.Route} route
     */
    getViewName(route) {
        console.log('DefaultRouteToViewNameTranslator::getViewName', route);
        let viewName = `${this.prefix}${route.path}${this.suffix}`;
        if (this.separator !== slash) {
            viewName = viewName.replace(slash, this.separator);
        }
        return viewName;
    }
}
/**
 */
/**
 */
/**
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtdG8tdmlldy1uYW1lLXRyYW5zbGF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcm91dGUtdG8tdmlldy1uYW1lLXRyYW5zbGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFRSDtHQUNHO0FBRUg7OztHQUdHO0FBRUgsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDOUIsS0FBSyxHQUFHLEdBQUcsQ0FBQztBQUVoQjs7R0FFRztBQUNILE1BQU0sT0FBTyxnQ0FBZ0M7SUFDekMsTUFBTSxDQUFTO0lBQ2YsU0FBUyxDQUFTO0lBQ2xCLE1BQU0sQ0FBUztJQUVmO1FBQ0ksY0FBYyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7WUFDM0IsS0FBSyxFQUFFLEVBQUU7WUFDVCxZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsSUFBSTtTQUNqQixDQUFDLENBQUM7UUFDSCxjQUFjLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRTtZQUM5QixLQUFLLEVBQUUsS0FBSztZQUNaLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxJQUFJO1NBQ2pCLENBQUMsQ0FBQztRQUNILGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFO1lBQzNCLEtBQUssRUFBRSxFQUFFO1lBQ1QsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLElBQUk7U0FDakIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOztPQUVHO0lBQ0gsV0FBVyxDQUFDLEtBQVk7UUFDcEIsT0FBTyxDQUFDLEdBQUcsQ0FBQywrQ0FBK0MsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNwRSxJQUFJLFFBQVEsR0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFbkUsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLEtBQUssRUFBRSxDQUFDO1lBQzNCLFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDdkQsQ0FBQztRQUVELE9BQU8sUUFBUSxDQUFDO0lBQ3BCLENBQUM7Q0FDSjtBQUVEO0dBQ0c7QUFFSDtHQUNHO0FBRUg7R0FDRyJ9