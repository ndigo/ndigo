/**
 */
import { describe, test, expect } from 'vitest';
import { direct, escalate, indexOf, type ChildNode, type ParentNode, type TreeNode } from '../src/tree-node';

interface Descendant extends ParentNode<Descendant> {
    name: string;
}

interface Ancestor extends ChildNode<Ancestor> {
    name: string;
}

describe('direct', () => {
    const tree: Descendant = {
        name: 'root',
        children: [
            { name: 'first', children: [{ name: 'nested', children: [] }] },
            { name: 'second', children: [] },
        ],
    };

    test('visits descendants depth-first in child order, excluding the starting node', () => {
        const visited: string[] = [];
        direct(tree, (node) => visited.push(node.name));
        expect(visited).toEqual(['first', 'nested', 'second']);
    });

    test('includes the starting node before its descendants', () => {
        const visited: string[] = [];
        direct(tree, (node) => visited.push(node.name), true);
        expect(visited).toEqual(['root', 'first', 'nested', 'second']);
    });

    test('false prunes only the visited branch, not later siblings', () => {
        const visited: string[] = [];
        direct(tree, (node) => {
            visited.push(node.name);
            return node.name !== 'first';
        });
        expect(visited).toEqual(['first', 'second']);
    });

    test('false at an inclusive starting node prunes all descendants', () => {
        const visited: string[] = [];
        direct(
            tree,
            (node) => {
                visited.push(node.name);
                return false;
            },
            true
        );
        expect(visited).toEqual(['root']);
    });

    test('does not visit siblings appended after a child list traversal starts', () => {
        const children: Descendant[] = [{ name: 'first', children: [] }];
        const root: Descendant = { name: 'root', children };
        const visited: string[] = [];

        direct(root, (node) => {
            visited.push(node.name);
            children.push({ name: 'appended', children: [] });
        });

        expect(visited).toEqual(['first']);
    });
});

describe('escalate', () => {
    const root: Ancestor = { name: 'root', parent: null };
    const parent: Ancestor = { name: 'parent', parent: root };
    const child: Ancestor = { name: 'child', parent };

    test('visits ancestors nearest-first, excluding the starting node', () => {
        const visited: string[] = [];
        escalate(child, (node) => visited.push(node.name));
        expect(visited).toEqual(['parent', 'root']);
    });

    test('includes the starting node before its ancestors', () => {
        const visited: string[] = [];
        escalate(child, (node) => visited.push(node.name), true);
        expect(visited).toEqual(['child', 'parent', 'root']);
    });

    test('false stops traversal before any further ancestor', () => {
        const visited: string[] = [];
        escalate(child, (node) => {
            visited.push(node.name);
            return false;
        });
        expect(visited).toEqual(['parent']);
    });

    test('an inclusive false result stops before the starting node parent', () => {
        const visited: string[] = [];
        escalate(
            child,
            (node) => {
                visited.push(node.name);
                return false;
            },
            true
        );
        expect(visited).toEqual(['child']);
    });

    test('a root with no parent has no ancestors', () => {
        const root: Ancestor = { name: 'root', parent: undefined };
        const visited: string[] = [];
        escalate(root, (node) => visited.push(node.name));
        expect(visited).toEqual([]);
    });

    test('visits a deep ancestor chain without overflowing the call stack', () => {
        let node: Ancestor = root;
        for (let depth = 0; depth < 20_000; depth++) {
            node = { name: 'ancestor', parent: node };
        }
        let count = 0;
        let last: Ancestor | undefined;
        escalate(
            node,
            (ancestor) => {
                count++;
                last = ancestor;
            },
            true
        );
        expect(count).toBe(20_001);
        expect(last).toBe(root);
    });
});

describe('indexOf', () => {
    const child: TreeNode = {
        children: [],
        parent: null,
        root: null,
        hasChild: () => false,
        newChild: () => undefined,
        removeChild: () => false,
    };
    const tree = { children: [{ ...child }, { ...child }, child] };

    test('it should return the index of', () => {
        expect(indexOf(tree.children, child)).toBe(2);
    });
});
