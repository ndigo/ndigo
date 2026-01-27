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
export declare function direct<T extends ParentNode>(node: T, callback: (node: T) => any, inclusive?: boolean): void;
export declare function escalate<T extends ChildNode>(node: T, callback: (node: T) => any, inclusive?: boolean): void;
export declare const indexOf: <T = any>(children: TreeNode<T>[], child: TreeNode<T>) => number;
//# sourceMappingURL=tree-node.d.ts.map