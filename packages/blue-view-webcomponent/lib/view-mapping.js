/**
 * @author Jeff Rose
 */
import 'reflect-metadata';
const VIEW_MAPPING = 'view:mapping', { assign } = Object, { defineMetadata, deleteMetadata, getMetadata, hasMetadata } = Reflect, defineViewMapping = (value, target) => defineMetadata(VIEW_MAPPING, value, target), deleteViewMapping = (target) => deleteMetadata(VIEW_MAPPING, target), getViewMapping = (target) => getMetadata(VIEW_MAPPING, target), hasViewMapping = (target) => hasMetadata(VIEW_MAPPING, target), viewMapping = (viewName) => (target) => {
    defineViewMapping(viewName, target);
};
/**
 * @param {string} viewName
 * @returns {Function}
 */
/**
 */
export const ViewMapping = assign(viewMapping, {
    /**
     * @param {*} value
     * @param {*} target
     */
    define: defineViewMapping,
    /**
     * @param {*} target
     */
    delete: deleteViewMapping,
    /**
     * @param {*} target
     * @returns {string}
     */
    get: getViewMapping,
    /**
     * @param {*} target
     * @returns {boolean} Whether or not the `target` has a view mapping.
     */
    has: hasViewMapping,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmlldy1tYXBwaW5nLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3ZpZXctbWFwcGluZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sa0JBQWtCLENBQUM7QUFFMUIsTUFBTSxZQUFZLEdBQUcsY0FBYyxFQUMvQixFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sRUFDbkIsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsR0FBRyxPQUFPLEVBQ3RFLGlCQUFpQixHQUFHLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBUSxFQUFFLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLEVBQ3hGLGlCQUFpQixHQUFHLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxjQUFjLENBQUMsWUFBWSxFQUFFLE1BQU0sQ0FBQyxFQUNwRSxjQUFjLEdBQUcsQ0FBQyxNQUFNLEVBQVUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsTUFBTSxDQUFDLEVBQ3RFLGNBQWMsR0FBRyxDQUFDLE1BQU0sRUFBVyxFQUFFLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxNQUFNLENBQUMsRUFDdkUsV0FBVyxHQUNQLENBQUMsUUFBZ0IsRUFBa0IsRUFBRSxDQUNyQyxDQUFDLE1BQU0sRUFBRSxFQUFFO0lBQ1AsaUJBQWlCLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ3hDLENBQUMsQ0FBQztBQUVWOzs7R0FHRztBQUVIO0dBQ0c7QUFDSCxNQUFNLENBQUMsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsRUFBRTtJQUMzQzs7O09BR0c7SUFDSCxNQUFNLEVBQUUsaUJBQWlCO0lBQ3pCOztPQUVHO0lBQ0gsTUFBTSxFQUFFLGlCQUFpQjtJQUN6Qjs7O09BR0c7SUFDSCxHQUFHLEVBQUUsY0FBYztJQUNuQjs7O09BR0c7SUFDSCxHQUFHLEVBQUUsY0FBYztDQUN0QixDQUFDLENBQUMifQ==