## Final Structure of Updated Benchmark File

### File Header
- Updated to show only these alternatives:
  1. **for-of** – manual loop over Object.entries, early-return on fail
  2. **every** – Object.entries + Array.every (short-circuiting)
  3. **keys+has** – Object.keys + hasOwnProperty, inline typeof check
  4. **direct** – raw property access, no Array helpers
  5. **current (WeakMap cached)** – production implementation; WeakMap descriptor cache

### Describe Blocks and Benchmarks:
1. `like – single-property ({ then: Function }) – match`
   - for-of
   - every
   - keys+has
   - direct
   - current (WeakMap cached)

2. `like – single-property ({ then: Function }) – fail`
   - for-of
   - every
   - keys+has
   - direct
   - current (WeakMap cached)

3. `like – single-property ({ then: Function }) – null`
   - for-of
   - every
   - keys+has
   - direct
   - current (WeakMap cached)

4. `like – two-property ({ destroy: Function, destroyed: Boolean }) – match`
   - for-of
   - every
   - keys+has
   - direct
   - current (WeakMap cached)

5. `like – two-property ({ destroy: Function, destroyed: Boolean }) – fail`
   - for-of
   - every
   - keys+has
   - direct
   - current (WeakMap cached)

6. `like – three-property ({ isRunning: Boolean, start: Function, stop: Function }) – match`
   - for-of
   - every
   - keys+has
   - direct
   - current (WeakMap cached)

7. `like – wxy descriptor ({ w: true, x: Number, y: Number }) – match`
   - for-of
   - every
   - keys+has
   - direct
   - current (WeakMap cached)

8. `like – wxy descriptor ({ w: true, x: Number, y: Number }) – fail`
   - for-of
   - every
   - keys+has
   - direct
   - current (WeakMap cached)

9. `like – theme descriptor ({ name: String, contentSource: Object }) – match`
   - for-of
   - every
   - keys+has
   - direct
   - current (WeakMap cached)

10. `like – theme descriptor ({ name: String, contentSource: Object }) – fail`
    - for-of
    - every
    - keys+has
    - direct
    - current (WeakMap cached)

11. `like – curried usage (descriptor applied to 10 diverse values)`
    - current (WeakMap cached, descriptor already cached)

12. `like – caching benefit (first call vs subsequent)`
    - current (WeakMap cached, descriptor already cached)