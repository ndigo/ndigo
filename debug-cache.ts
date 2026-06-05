import { LRUCache } from './src/_lru-cache';

// Test the specific failing scenario
const cache = new LRUCache<string, number>(2);
cache.set('a', 1);
cache.set('b', 2);
console.log('After setting a and b:');
console.log('Cache size:', cache.size);
console.log('Cache keys:', Array.from(cache.#map.keys()));

console.log('Calling has("a") - should NOT promote');
cache.has('a');
console.log('Cache size after has():', cache.size);
console.log('Cache keys after has():', Array.from(cache.#map.keys()));

console.log('Setting c - should evict b (not a)');
cache.set('c', 3);
console.log('Cache size after setting c:', cache.size);
console.log('Cache keys after setting c:', Array.from(cache.#map.keys()));

console.log('Trying to get "a":', cache.get('a'));
console.log('Trying to get "b":', cache.get('b'));
console.log('Trying to get "c":', cache.get('c'));