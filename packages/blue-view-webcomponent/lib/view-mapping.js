/**
 * @author Jeff Rose
 */
import 'reflect-metadata';
const VIEW_MAPPING = 'view:mapping', { assign } = Object, { defineMetadata, deleteMetadata, getMetadata, hasMetadata } = Reflect, defineViewMapping = (value, target) => defineMetadata(VIEW_MAPPING, value, target), deleteViewMapping = (target) => deleteMetadata(VIEW_MAPPING, target), getViewMapping = (target) => getMetadata(VIEW_MAPPING, target), hasViewMapping = (target) => hasMetadata(VIEW_MAPPING, target), viewMapping = (viewName) => (target) => {
    defineViewMapping(viewName, target);
};
/**
 * @function module:dispatcher.ViewMapping
 * @param {external:string} viewName
 * @returns {external:Function}
 */
/**
 * @const {external:ClassDecorator} module:dispatcher.ViewMapping(2)
 */
export const ViewMapping = assign(viewMapping, {
    /**
     * @function module:dispatcher.ViewMapping.define
     * @param {*} value
     * @param {*} target
     */
    define: defineViewMapping,
    /**
     * @function module:dispatcher.ViewMapping.delete
     * @param {*} target
     */
    delete: deleteViewMapping,
    /**
     * @function module:dispatcher.ViewMapping.get
     * @param {*} target
     * @returns {external:string}
     */
    get: getViewMapping,
    /**
     * @function module:dispatcher.ViewMapping.has
     * @param {*} target
     * @returns {external:boolean} Whether or not the `target` has a view mapping.
     */
    has: hasViewMapping,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy1tYXBwaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3ZpZXctbWFwcGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sa0JBQWtCLENBQUM7QUFFMUIsTUFBTSxZQUFZLEdBQUcsY0FBYyxFQUMvQixFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sRUFDbkIsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsR0FBRyxPQUFPLEVBQ3RFLGlCQUFpQixHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBUSxFQUFFLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLEVBQ3hGLGlCQUFpQixHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxFQUNwRSxjQUFjLEdBQUcsQ0FBQyxNQUFNLEVBQVUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLEVBQ3RFLGNBQWMsR0FBRyxDQUFDLE1BQU0sRUFBVyxFQUFFLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsRUFDdkUsV0FBVyxHQUNQLENBQUMsUUFBZ0IsRUFBa0IsRUFBRSxDQUNyQyxDQUFDLE1BQU0sRUFBRSxFQUFFO0lBQ1AsaUJBQWlCLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3hDLENBQUMsQ0FBQztBQUVWOzs7O0dBSUc7QUFFSDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsV0FBVyxFQUFFO0lBQzNDOzs7O09BSUc7SUFDSCxNQUFNLEVBQUUsaUJBQWlCO0lBQ3pCOzs7T0FHRztJQUNILE1BQU0sRUFBRSxpQkFBaUI7SUFDekI7Ozs7T0FJRztJQUNILEdBQUcsRUFBRSxjQUFjO0lBQ25COzs7O09BSUc7SUFDSCxHQUFHLEVBQUUsY0FBYztDQUN0QixDQUFDLENBQUMifQ==