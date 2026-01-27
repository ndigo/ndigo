/**
 * @author Jeff Rose
 */
/**
 */
/**
 */
/**
 */
/**
 */
/**
 * @extends module:core.ChildNode
 * @extends module:core.ParentNode
 */
/**
 */
/**
 * @param {T} node
 * @returns {boolean}
 */
/**
 * @param {...*} args
 * @returns {T}
 */
/**
 * @param {T} node
 * @returns {boolean}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS1ub2RlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RyZWUtbm9kZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQWlCSDtHQUNHO0FBRUg7R0FDRztBQUVIO0dBQ0c7QUFFSDtHQUNHO0FBRUg7OztHQUdHO0FBRUg7R0FDRztBQUVIOzs7R0FHRztBQUVIOzs7R0FHRztBQUVIOzs7R0FHRztBQUVILE1BQU0sVUFBVSxNQUFNLENBQXVCLElBQU8sRUFBRSxRQUEwQixFQUFFLFlBQXFCLEtBQUs7SUFDeEcsTUFBTSxPQUFPLEdBQVEsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBRXhELElBQUksT0FBTyxFQUFFLE1BQU0sRUFBRSxDQUFDO1FBQ2xCLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFTLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSyxLQUFLLElBQUksTUFBTSxDQUFJLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQzlGLENBQUM7QUFDTCxDQUFDO0FBRUQsTUFBTSxVQUFVLFFBQVEsQ0FBc0IsSUFBTyxFQUFFLFFBQTBCLEVBQUUsWUFBcUIsS0FBSztJQUN6RyxNQUFNLE1BQU0sR0FBTSxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUVqRCxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQ1QsUUFBUSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEtBQUssSUFBSSxRQUFRLENBQUksTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7QUFDTCxDQUFDO0FBRUQsTUFBTSxDQUFDLE1BQU0sT0FBTyxHQUFHLENBQVUsUUFBdUIsRUFBRSxLQUFrQixFQUFVLEVBQUUsQ0FDcEYsUUFBUSxFQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDIn0=