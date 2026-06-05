// Let me trace the exact sequence from the failing test manually

console.log("=== Manual Trace ===");

// Step 1: Create cache with capacity 2
console.log("1. Created LRUCache<string, number>(2)");

// Step 2: cache.set('a', 1)
console.log("2. cache.set('a', 1) - cache now has ['a']");

// Step 3: cache.set('b', 2) 
console.log("3. cache.set('b', 2) - cache now has ['a', 'b'] (insertion order)");

// Step 4: cache.has('a') - should NOT promote
console.log("4. cache.has('a') - does NOT promote, so insertion order still ['a', 'b']");

// Step 5: cache.set('c', 3) - capacity is 2, so evict first item in insertion order
console.log("5. cache.set('c', 3) - capacity = 2, evict first item which is 'a'");
console.log("   Cache now has ['b', 'c']");

// Step 6: expect(cache.get('a')).toBe(1)
console.log("6. expect(cache.get('a')).toBe(1)");
console.log("   But cache.get('a') should return undefined because 'a' was evicted");

console.log("\nThis means the test expectation is wrong, or I'm misunderstanding something.");
console.log("Let me re-read the test more carefully...");

console.log("\nWait - let me check if there's a different interpretation:");
console.log("Maybe the test is expecting that 'a' should NOT be evicted in this case?");
console.log("But that would mean 'has()' somehow changed the insertion order...");