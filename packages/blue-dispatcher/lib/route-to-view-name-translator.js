/**
 * @author Jeff Rose
 */
/**
 * @interface module:router.RouteToViewNameTranslator
 */
/**
 * @function module:router.RouteToViewNameTranslator#getViewName
 * @param {module:router.Route} route
 * @returns {external:string}
 */
const { defineProperty } = Reflect, slash = '/';
/**
 * @class module:dispatcher.DefaultRouteToViewNameTranslator
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
     * @function module:dispatcher.DefaultRouteToViewNameTranslator#getViewName
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
 * @member {external:string} module:dispatcher.DefaultRouteToViewNameTranslator#prefix=''
 */
/**
 * @member {external:string} module:dispatcher.DefaultRouteToViewNameTranslator#separator='/'
 */
/**
 * @member {external:string} module:dispatcher.DefaultRouteToViewNameTranslator#suffix=''
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtdG8tdmlldy1uYW1lLXRyYW5zbGF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcm91dGUtdG8tdmlldy1uYW1lLXRyYW5zbGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFRSDs7R0FFRztBQUVIOzs7O0dBSUc7QUFFSCxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM5QixLQUFLLEdBQUcsR0FBRyxDQUFDO0FBRWhCOzs7R0FHRztBQUNILE1BQU0sT0FBTyxnQ0FBZ0M7SUFDekMsTUFBTSxDQUFTO0lBQ2YsU0FBUyxDQUFTO0lBQ2xCLE1BQU0sQ0FBUztJQUVmO1FBQ0ksY0FBYyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUU7WUFDM0IsS0FBSyxFQUFFLEVBQUU7WUFDVCxZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsSUFBSTtTQUNqQixDQUFDLENBQUM7UUFDSCxjQUFjLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRTtZQUM5QixLQUFLLEVBQUUsS0FBSztZQUNaLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxJQUFJO1NBQ2pCLENBQUMsQ0FBQztRQUNILGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFO1lBQzNCLEtBQUssRUFBRSxFQUFFO1lBQ1QsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLElBQUk7U0FDakIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7T0FHRztJQUNILFdBQVcsQ0FBQyxLQUFZO1FBQ3BCLE9BQU8sQ0FBQyxHQUFHLENBQUMsK0NBQStDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDcEUsSUFBSSxRQUFRLEdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBRW5FLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxLQUFLLEVBQUUsQ0FBQztZQUMzQixRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3ZELENBQUM7UUFFRCxPQUFPLFFBQVEsQ0FBQztJQUNwQixDQUFDO0NBQ0o7QUFFRDs7R0FFRztBQUVIOztHQUVHO0FBRUg7O0dBRUcifQ==