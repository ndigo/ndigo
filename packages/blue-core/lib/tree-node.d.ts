/**
 * @author Jeff Rose
 */
export interface ChildNode<T = any> {
    readonly parent: T;
}
export interface ParentNode<T = any> {
    readonly children: T[];
}
export interface TreeNode<T = any> extends ChildNode<T>, ParentNode<T> {
    readonly root: T;
    hasChild(node: T): boolean;
    newChild(...args: any[]): T;
    removeChild(node: T): boolean;
}
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
export declare function direct<T extends ParentNode>(node: T, callback: (node: T) => any, inclusive?: boolean): void;
export declare function escalate<T extends ChildNode>(node: T, callback: (node: T) => any, inclusive?: boolean): void;
export declare const indexOf: <T = any>(children: TreeNode<T>[], child: TreeNode<T>) => number;
//# sourceMappingURL=tree-node.d.ts.map
