/**
 * A prefix tree (trie) for string keys with O(m) insert/search/prefix
 * operations, where m is the key length.
 */
import { Serializable, JSONArray, serialize } from './serializable.js';
import { Equatable } from './equatable.js';

interface TrieNode<V> {
    children: Map<string, TrieNode<V>>;
    value: V | undefined;
    terminal: boolean;
}

export class Trie<V = unknown> implements Serializable, Equatable<Trie<V>> {
    #root: TrieNode<V> = { children: new Map(), value: undefined, terminal: false };
    #size: number = 0;

    get [Symbol.toStringTag](): string {
        return 'Trie';
    }

    /**
     * Number of stored words.
     */
    get size(): number {
        return this.#size;
    }

    /**
     * Adds a word or replaces its value.
     *
     * @param word - The key to store.
     * @param value - The value to associate with the key.
     * @returns This trie, for chaining.
     */
    insert(word: string, value: V): this {
        let node = this.#root;
        for (const ch of word) {
            let child = node.children.get(ch);
            if (child === undefined) {
                child = { children: new Map(), value: undefined, terminal: false };
                node.children.set(ch, child);
            }
            node = child;
        }
        if (!node.terminal) {
            this.#size++;
        }
        node.terminal = true;
        node.value = value;
        return this;
    }

    /**
     * Looks up a complete word.
     *
     * @param word - The exact key to find.
     * @returns The stored value, or `undefined` when the word is absent.
     */
    search(word: string): V | undefined {
        const node = this.#findNode(word);
        return node !== null && node.terminal ? node.value : undefined;
    }

    /**
     * Tests for a complete word.
     *
     * @param word - The exact key to test.
     * @returns `true` when the word was inserted.
     */
    has(word: string): boolean {
        const node = this.#findNode(word);
        return node !== null && node.terminal;
    }

    #findNode(prefix: string): TrieNode<V> | null {
        let node: TrieNode<V> | null = this.#root;
        for (const ch of prefix) {
            if (node === null) return null;
            const child = node.children.get(ch);
            node = child === undefined ? null : child;
        }
        return node;
    }

    /**
     * Tests whether any word begins with the prefix.
     *
     * @param prefix - The prefix to test.
     * @returns `true` when a stored word starts with `prefix`.
     */
    startsWith(prefix: string): boolean {
        return this.#findNode(prefix) !== null;
    }

    /**
     * Removes a word and prunes now-empty branches.
     *
     * @param word - The exact key to remove.
     * @returns `true` when the word was present.
     */
    delete(word: string): boolean {
        // recursive deletion
        const remove = (node: TrieNode<V>, target: string, depth: number): boolean => {
            if (depth === target.length) {
                if (!node.terminal) return false;
                node.terminal = false;
                node.value = undefined;
                this.#size--;
                return node.children.size === 0;
            }
            const ch = target[depth];
            const child = node.children.get(ch);
            if (child === undefined) return false;
            const shouldDeleteChild = remove(child, target, depth + 1);
            if (shouldDeleteChild) {
                node.children.delete(ch);
                return !node.terminal && node.children.size === 0;
            }
            return false;
        };
        return remove(this.#root, word, 0);
    }

    /**
     * Yields every word starting with the prefix, depth first.
     *
     * @param prefix - The prefix to expand; `''` yields every word.
     * @returns A generator of `[word, value]` pairs.
     */
    *wordsWithPrefix(prefix: string): Generator<[string, V]> {
        const node = this.#findNode(prefix);
        if (node === null) return;
        const stack: Array<[TrieNode<V>, string]> = [[node, prefix]];
        while (stack.length > 0) {
            const [current, currentWord] = stack.pop() as [TrieNode<V>, string];
            if (current.terminal) {
                yield [currentWord, current.value as V];
            }
            for (const [ch, child] of current.children) {
                stack.push([child, currentWord + ch]);
            }
        }
    }

    /**
     * Removes every word.
     */
    clear(): void {
        this.#root = { children: new Map(), value: undefined, terminal: false };
        this.#size = 0;
    }

    /**
     * Returns the entries as `[word, value]` pairs.
     *
     * @returns A JSON array of word/value pairs.
     */
    toJSON(): JSONArray {
        const entries: Array<[string, V]> = [];
        for (const [word, value] of this.wordsWithPrefix('')) {
            entries.push([word, value]);
        }
        // serialize as array of [word, value]
        return entries.map(([w, v]) => [w, serialize(v)] as unknown as JSONArray[number]) as JSONArray;
    }

    /**
     * Summarizes the trie.
     *
     * @returns The stored word count.
     */
    toString(): string {
        return `${this.#size} entries`;
    }

    /**
     * Compares every stored word and value.
     *
     * @param value - The candidate to compare against.
     * @returns `true` when both tries hold the same words and values.
     */
    equals(value: unknown): boolean {
        if (!(value instanceof Trie)) return false;
        if (value.size !== this.#size) return false;
        for (const [word, v] of this.wordsWithPrefix('')) {
            if (value.search(word) !== v) return false;
        }
        return true;
    }
}
