/**
 * @author Jeff Rose
 */
import 'reflect-metadata';
const TAG_MAPPING = 'tag:mapping', { assign } = Object, { defineMetadata, deleteMetadata, getMetadata, hasMetadata } = Reflect, defineTagMapping = (value, target) => defineMetadata(TAG_MAPPING, value, target), deleteTagMapping = (target) => deleteMetadata(TAG_MAPPING, target), getTagMapping = (target) => getMetadata(TAG_MAPPING, target), hasTagMapping = (target) => hasMetadata(TAG_MAPPING, target), tagMapping = (tagName) => (target) => {
    defineTagMapping(tagName, target);
    customElements.define(tagName, target);
};
/**
 * @function module:dispatcher.TagMapping
 * @param {external:string} tagName
 * @returns {external:Function}
 */
/**
 * @const {external:ClassDecorator} module:dispatcher.TagMapping(2)
 */
export const TagMapping = assign(tagMapping, {
    /**
     * @function module:dispatcher.TagMapping.define
     * @param {*} value
     * @param {*} target
     */
    define: defineTagMapping,
    /**
     * @function module:dispatcher.TagMapping.delete
     * @param {*} target
     */
    delete: deleteTagMapping,
    /**
     * @function module:dispatcher.TagMapping.get
     * @param {*} target
     * @returns {external:string}
     */
    get: getTagMapping,
    /**
     * @function module:dispatcher.TagMapping.has
     * @param {*} target
     * @returns {external:boolean} Whether or not the `target` has a tag mapping.
     */
    has: hasTagMapping,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFnLW1hcHBpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdGFnLW1hcHBpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLGtCQUFrQixDQUFDO0FBRTFCLE1BQU0sV0FBVyxHQUFHLGFBQWEsRUFDN0IsRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLEVBQ25CLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLEdBQUcsT0FBTyxFQUN0RSxnQkFBZ0IsR0FBRyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQVEsRUFBRSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxFQUN0RixnQkFBZ0IsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsRUFDbEUsYUFBYSxHQUFHLENBQUMsTUFBTSxFQUFVLEVBQUUsQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxFQUNwRSxhQUFhLEdBQUcsQ0FBQyxNQUFNLEVBQVcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLEVBQ3JFLFVBQVUsR0FDTixDQUFDLE9BQWUsRUFBa0IsRUFBRSxDQUNwQyxDQUFDLE1BQU0sRUFBRSxFQUFFO0lBQ1AsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ2xDLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLE1BQTZDLENBQUMsQ0FBQztBQUNsRixDQUFDLENBQUM7QUFFVjs7OztHQUlHO0FBRUg7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsRUFBRTtJQUN6Qzs7OztPQUlHO0lBQ0gsTUFBTSxFQUFFLGdCQUFnQjtJQUN4Qjs7O09BR0c7SUFDSCxNQUFNLEVBQUUsZ0JBQWdCO0lBQ3hCOzs7O09BSUc7SUFDSCxHQUFHLEVBQUUsYUFBYTtJQUNsQjs7OztPQUlHO0lBQ0gsR0FBRyxFQUFFLGFBQWE7Q0FDckIsQ0FBQyxDQUFDIn0=