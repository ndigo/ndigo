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

export function direct<T extends ParentNode>(node: T, callback: (node: T) => any, inclusive: boolean = false): void {
    const targets: T[] = inclusive ? [node] : node.children;

    if (targets?.length) {
        targets.forEach((target: T) => callback(target) !== false && direct<T>(target, callback));
    }
}

export function escalate<T extends ChildNode>(node: T, callback: (node: T) => any, inclusive: boolean = false): void {
    const target: T = inclusive ? node : node.parent;

    if (target) {
        callback(target) !== false && escalate<T>(target, callback);
    }
}

export const indexOf = <T = any>(children: TreeNode<T>[], child: TreeNode<T>): number =>
    children?.length && child ? children.indexOf(child) : -1;
