// Let me create a simple test file to see what's happening in the exact failing case

import { LRUCache } from './src/_lru-cache';

// This is exactly the failing test case
const cache = new LRUCache<string, number>(2);
console.log("Created cache with capacity 2");

cache.set('a', 1);
console.log("After set('a', 1): size =", cache.size);

cache.set('b', 2);  
console.log("After set('b', 2): size =", cache.size);

console.log("Before has('a'): cache.has('a') =", cache.has('a'));

// This is the key part - has() should NOT promote
cache.has('a'); 
console.log("After has('a'): size =", cache.size, "has('a') =", cache.has('a'));

cache.set('c', 3); // This should evict 'b', not 'a'
console.log("After set('c', 3): size =", cache.size);

// Let's see what keys are in the cache
const keys = [];
for (const key of cache.#map.keys()) {
    keys.push(key);
}
console.log("Cache keys in order:", keys);

console.log("get('a'):", cache.get('a'));
console.log("get('b'):", cache.get('b')); 
console.log("get('c'):", cache.get('c'));

console.log("Expected: get('a') should be 1, get('b') should be undefined, get('c') should be 3");