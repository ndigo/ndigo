/**
 * @author Jeff Rose
 */
/**
 * A node that can reference its parent.
 */
export interface ChildNode<T = any> {
    /** The parent node, or `null`/`undefined` for roots. */
    readonly parent: T | null | undefined;
}
/**
 * A node that can enumerate its children.
 */
export interface ParentNode<T = any> {
    /** The node's direct children. */
    readonly children: readonly T[];
}
/**
 * A tree node that supports bidirectional navigation and child mutation.
 */
export interface TreeNode<T = any> extends ChildNode<T>, ParentNode<T> {
    /** The root node of the tree. */
    readonly root: T;
    /**
     * Tests whether the node has the given direct child.
     *
     * @param node - Candidate child node.
     * @returns `true` when the node is a direct child.
     */
    hasChild(node: T): boolean;
    /**
     * Creates and appends a new child node.
     *
     * @param args - Arguments used to construct the child.
     * @returns The newly created child node.
     */
    newChild(...args: any[]): T;
    /**
     * Removes a direct child from the node.
     *
     * @param node - Child node to remove.
     * @returns `true` when the child was removed.
     */
    removeChild(node: T): boolean;
}
/**
 * Traverses descendants depth-first from the supplied node.
 *
 * @param node - Starting node.
 * @param callback - Function invoked for each visited node.
 * @param inclusive - When `true`, include the starting node in the traversal.
 */
export declare function direct<T extends ParentNode>(node: T, callback: (node: T) => any, inclusive?: boolean): void;
/**
 * Traverses ancestors upward from the supplied node.
 *
 * @param node - Starting node.
 * @param callback - Function invoked for each visited node.
 * @param inclusive - When `true`, include the starting node in the traversal.
 */
export declare function escalate<T extends ChildNode>(node: T, callback: (node: T) => any, inclusive?: boolean): void;
/**
 * Finds the index of a child within a list of tree nodes.
 *
 * @param children - Candidate children to search.
 * @param child - Child node to locate.
 * @returns The index of the child, or `-1` when it is not present.
 */
export declare const indexOf: <T = any>(children: TreeNode<T>[], child: TreeNode<T>) => number;
