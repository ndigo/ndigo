/**
 * A node that can reference its parent.
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
export interface ChildNode<T = unknown> {
    /** The parent node, or `null`/`undefined` for roots. */
    readonly parent: T | null | undefined;
}

/**
 * A node that can enumerate its children.
 */
export interface ParentNode<T = unknown> {
    /** The node's direct children. */
    readonly children: readonly T[];
}

/**
 * A tree node that supports bidirectional navigation and child mutation.
 */
export interface TreeNode<T = unknown> extends ChildNode<T>, ParentNode<T> {
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
    newChild(...args: unknown[]): T;

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
 * @param callback - Function invoked for each visited node; returning `false` prunes that node's descendants.
 * @param inclusive - When `true`, include the starting node in the traversal.
 */
export function direct<T extends ParentNode<T>>(
    node: T,
    callback: (node: T) => unknown,
    inclusive: boolean = false
): void {
    const targets: readonly T[] = inclusive ? [node] : node.children;

    if (targets?.length) {
        targets.forEach((target: T) => callback(target) !== false && direct<T>(target, callback));
    }
}

/**
 * Traverses ancestors upward from the supplied node.
 *
 * @param node - Starting node.
 * @param callback - Function invoked for each visited node; returning `false` stops traversal.
 * @param inclusive - When `true`, include the starting node in the traversal.
 */
export function escalate<T extends ChildNode<T>>(
    node: T,
    callback: (node: T) => unknown,
    inclusive: boolean = false
): void {
    let target: T | null | undefined = inclusive ? node : node.parent;

    while (target) {
        if (callback(target) === false) {
            return;
        }
        target = target.parent;
    }
}

/**
 * Finds the index of a child within a list of tree nodes.
 *
 * @param children - Candidate children to search.
 * @param child - Child node to locate.
 * @returns The index of the child, or `-1` when it is not present.
 */
export const indexOf = <T = unknown>(children: TreeNode<T>[], child: TreeNode<T>): number =>
    children?.length && child ? children.indexOf(child) : -1;
