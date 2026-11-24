import { describe, it, expect } from 'vitest';
import { Trie } from '../src/trie';

describe('Trie', () => {
    it('insert/search', () => {
        const t = new Trie<number>();
        t.insert('foo', 1).insert('bar', 2);
        expect(t.search('foo')).toBe(1);
        expect(t.search('baz')).toBeUndefined();
        expect(t.has('bar')).toBe(true);
    });

    it('startsWith and wordsWithPrefix', () => {
        const t = new Trie<number>();
        t.insert('cat', 1).insert('car', 2).insert('dog', 3);
        expect(t.startsWith('ca')).toBe(true);
        expect([...t.wordsWithPrefix('ca')].map(([w]) => w).sort()).toEqual(['car', 'cat']);
    });

    it('delete', () => {
        const t = new Trie<number>();
        t.insert('foo', 1);
        expect(t.delete('foo')).toBe(true);
        expect(t.has('foo')).toBe(false);
        expect(t.size).toBe(0);
    });
});
