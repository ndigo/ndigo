/**
 * @author Jeff Rose
 */
/**
 * @interface module:core.ChildNode
 */
/**
 * @member {T} module:core.ChildNode#parent
 */
/**
 * @interface module:core.ParentNode
 */
/**
 * @member {external:Array<T>} module:core.ParentNode#children
 */
/**
 * @interface module:core.TreeNode
 * @extends module:core.ChildNode
 * @extends module:core.ParentNode
 */
/**
 * @member {T} module:core.TreeNode#root
 */
/**
 * @function module:core.TreeNode#hasChild
 * @param {T} node
 * @returns {external:boolean}
 */
/**
 * @function module:core.TreeNode#newChild
 * @param {...*} args
 * @returns {T}
 */
/**
 * @function module:core.TreeNode#removeChild
 * @param {T} node
 * @returns {external:boolean}
 */
export function direct(node, callback, inclusive = false) {
    const targets = inclusive ? [node] : node.children;
    if (targets?.length) {
        targets.forEach((target) => callback(target) !== false && direct(target, callback));
    }
}
export function escalate(node, callback, inclusive = false) {
    const target = inclusive ? node : node.parent;
    if (target) {
        callback(target) !== false && escalate(target, callback);
    }
}
export const indexOf = (children, child) => children?.length && child ? children.indexOf(child) : -1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS1ub2RlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RyZWUtbm9kZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQWlCSDs7R0FFRztBQUVIOztHQUVHO0FBRUg7O0dBRUc7QUFFSDs7R0FFRztBQUVIOzs7O0dBSUc7QUFFSDs7R0FFRztBQUVIOzs7O0dBSUc7QUFFSDs7OztHQUlHO0FBRUg7Ozs7R0FJRztBQUVILE1BQU0sVUFBVSxNQUFNLENBQXVCLElBQU8sRUFBRSxRQUEwQixFQUFFLFlBQXFCLEtBQUs7SUFDeEcsTUFBTSxPQUFPLEdBQVEsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBRXhELElBQUksT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDO1FBQ2xCLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFTLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxLQUFLLElBQUksTUFBTSxDQUFJLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQzlGLENBQUM7QUFDTCxDQUFDO0FBRUQsTUFBTSxVQUFVLFFBQVEsQ0FBc0IsSUFBTyxFQUFFLFFBQTBCLEVBQUUsWUFBcUIsS0FBSztJQUN6RyxNQUFNLE1BQU0sR0FBTSxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUVqRCxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQ1QsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEtBQUssSUFBSSxRQUFRLENBQUksTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7QUFDTCxDQUFDO0FBRUQsTUFBTSxDQUFDLE1BQU0sT0FBTyxHQUFHLENBQVUsUUFBdUIsRUFBRSxLQUFrQixFQUFVLEVBQUUsQ0FDcEYsUUFBUSxFQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDIn0=