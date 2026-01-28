/**
 * @author Jeff Rose
 */
import 'reflect-metadata';
const TAG_MAPPING = 'tag:mapping', { assign } = Object, { defineMetadata, deleteMetadata, getMetadata, hasMetadata } = Reflect, defineTagMapping = (value, target) => defineMetadata(TAG_MAPPING, value, target), deleteTagMapping = (target) => deleteMetadata(TAG_MAPPING, target), getTagMapping = (target) => getMetadata(TAG_MAPPING, target), hasTagMapping = (target) => hasMetadata(TAG_MAPPING, target), tagMapping = (tagName) => (target) => {
    defineTagMapping(tagName, target);
    customElements.define(tagName, target);
};
/**
 * @param {string} tagName
 * @returns {Function}
 */
/**
 */
export const TagMapping = assign(tagMapping, {
    /**
     * @param {*} value
     * @param {*} target
     */
    define: defineTagMapping,
    /**
     * @param {*} target
     */
    delete: deleteTagMapping,
    /**
     * @param {*} target
     * @returns {string}
     */
    get: getTagMapping,
    /**
     * @param {*} target
     * @returns {boolean} Whether or not the `target` has a tag mapping.
     */
    has: hasTagMapping,
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFnLW1hcHBpbmcuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvdGFnLW1hcHBpbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLGtCQUFrQixDQUFDO0FBRTFCLE1BQU0sV0FBVyxHQUFHLGFBQWEsRUFDN0IsRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLEVBQ25CLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLEdBQUcsT0FBTyxFQUN0RSxnQkFBZ0IsR0FBRyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQVEsRUFBRSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxFQUFFLE1BQU0sQ0FBQyxFQUN0RixnQkFBZ0IsR0FBRyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsRUFDbEUsYUFBYSxHQUFHLENBQUMsTUFBTSxFQUFVLEVBQUUsQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxFQUNwRSxhQUFhLEdBQUcsQ0FBQyxNQUFNLEVBQVcsRUFBRSxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLEVBQ3JFLFVBQVUsR0FDTixDQUFDLE9BQWUsRUFBa0IsRUFBRSxDQUNwQyxDQUFDLE1BQU0sRUFBRSxFQUFFO0lBQ1AsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ2xDLGNBQWMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLE1BQTZDLENBQUMsQ0FBQztBQUNsRixDQUFDLENBQUM7QUFFVjs7O0dBR0c7QUFFSDtHQUNHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQyxVQUFVLEVBQUU7SUFDekM7OztPQUdHO0lBQ0gsTUFBTSxFQUFFLGdCQUFnQjtJQUN4Qjs7T0FFRztJQUNILE1BQU0sRUFBRSxnQkFBZ0I7SUFDeEI7OztPQUdHO0lBQ0gsR0FBRyxFQUFFLGFBQWE7SUFDbEI7OztPQUdHO0lBQ0gsR0FBRyxFQUFFLGFBQWE7Q0FDckIsQ0FBQyxDQUFDIn0=