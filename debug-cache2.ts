// Let's manually trace through the exact failing test case
import { LRUCache } from './src/_lru-cache';

console.log('=== Manual Test of Failing Case ===');

const cache = new LRUCache<string, number>(2);
console.log('Created cache with capacity 2');

cache.set('a', 1);
console.log('After set("a", 1): size =', cache.size);

cache.set('b', 2);  
console.log('After set("b", 2): size =', cache.size);

console.log('Before has("a"): cache has a?', cache.has('a'));

// This is the key part - has() should NOT promote
cache.has('a'); 
console.log('After has("a"): size =', cache.size, 'has a?', cache.has('a'));

cache.set('c', 3); // This should evict 'b' (the LRU), not 'a'
console.log('After set("c", 3): size =', cache.size);

console.log('Cache contents:');
for (const [key, value] of cache.#map) {
    console.log(`  ${key}: ${value}`);
}

console.log('get("a"):', cache.get('a'));
console.log('get("b"):', cache.get('b')); 
console.log('get("c"):', cache.get('c'));

console.log('Expected: get("a") should be 1, get("b") should be undefined, get("c") should be 3');