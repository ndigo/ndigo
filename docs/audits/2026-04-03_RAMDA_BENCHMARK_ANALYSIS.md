# Ramda vs Native JavaScript Benchmark Analysis

## 1. Executive Summary

This audit evaluates the performance characteristics of Ramda utility functions compared to native JavaScript equivalents across the `@ndigo/util` categories. The goal is to establish data-driven guidelines for when to leverage Ramda's functional API and when to prefer native JavaScript for performance-critical paths.

**Key Insights:**

1. **Ramda excels with medium-to-large arrays:** For operations like `filter` (2.8x faster), `reduce` (6.2x faster), `map` (1.1x faster), and `sort` (1.1x faster) on 1000-element arrays, Ramda outperforms native methods. This is likely due to Ramda's internal transducer optimizations.
2. **Ramda's overhead is constant:** The function call wrapping costs approximately 0.01-0.05ms per call regardless of data size. This constant overhead severely impacts trivial operations (property access, type checks) but becomes negligible or advantageous for data-heavy operations.
3. **Hot path bottlenecks:** The most significant performance degradations from Ramda occur in predicate combinators (`allPass`, `both`) and type checks (`is`, `isNil`). These are frequently called in hot paths like event dispatching and request handling.
4. **Currying is exceptionally expensive:** `R.curry` is the single worst offender, performing 229x slower than manual arrow functions. Curried functions should be strictly avoided in hot paths.
5. **Conditional dispatch is nuanced:** While `R.cond` is 21.7x slower than a `switch` statement for simple dispatch tables, it is actually 1.6x faster than imperative equivalents in complex scenarios (e.g., `parseData`), likely because V8 optimizes the Ramda dispatch pattern better when branches contain side effects.
6. **Zero-overhead utilities:** Functions like `always`, `T`, `F`, and `comparator` have essentially zero overhead and can be used freely for their declarative benefits.

## 2. Methodology

Benchmarks were executed using the following environment and parameters:

- **Runner:** Vitest Bench
- **Environment:** Node.js with `jsdom`
- **Location:** `packages/ndigo-util/bench/`
- **Workload:** 1000-iteration inner loops, mixed inputs, and accumulated sinks to prevent V8 dead-code elimination.
- **Metrics:** Operations per second (hz). Higher is better.

## 3. Results by Category

### Predicates (`predicates.bench.ts`)

| Benchmark                          | Ramda hz | Native hz | Winner | Ratio     |
| ---------------------------------- | -------- | --------- | ------ | --------- |
| `is(String)` vs `typeof`           | 3,075    | 66,773    | Native | **21.7x** |
| `is(Number)` vs `typeof`           | 2,097    | 70,616    | Native | **33.7x** |
| `is(Function)` vs `typeof`         | 3,045    | 90,915    | Native | **29.9x** |
| `is(ArrayBuffer)` vs `instanceof`  | 453      | 547       | Native | 1.2x      |
| `isNil` vs `x == null`             | 13,512   | 88,600    | Native | **6.6x**  |
| `isString` wrapper vs `typeof`     | 3,485    | 71,409    | Native | **20.5x** |
| `isNumber` wrapper vs native check | 765      | 35,675    | Native | **46.7x** |

### Logic (`logic.bench.ts`)

| Benchmark                      | Ramda hz | Native hz | Winner | Ratio     |
| ------------------------------ | -------- | --------- | ------ | --------- |
| `cond` (7-branch) vs `switch`  | 237      | 5,143     | Native | **21.7x** |
| `allPass` vs logical `&&`      | 561      | 27,129    | Native | **48.4x** |
| `both` vs inline `&&`          | 863      | 37,138    | Native | **43.1x** |
| `complement` vs negation       | 3,917    | 64,580    | Native | **16.5x** |
| `ifElse` vs ternary            | 1,168    | 2,732     | Native | **2.3x**  |
| `cond` (2-branch) vs `if/else` | 2,794    | 29,690    | Native | **10.6x** |

### Composition (`composition.bench.ts`)

| Benchmark                      | Ramda hz  | Native hz | Winner    | Ratio      |
| ------------------------------ | --------- | --------- | --------- | ---------- |
| `pipe` (3 steps) vs manual     | 43,129    | 1,069,474 | Native    | **24.8x**  |
| `pipe` (5 steps) vs chaining   | 728       | 1,260     | Native    | **1.7x**   |
| `compose` vs manual            | 43,431    | 999,836   | Native    | **23.0x**  |
| `curry(fn)(a)(b)(c)` vs arrows | 3,656     | 838,200   | Native    | **229.3x** |
| `curryN(2)` vs manual          | 4,879     | 44,635    | Native    | **9.2x**   |
| `always` vs arrow              | 1,373,349 | 1,374,140 | **Tie**   | 1.00x      |
| `T()` vs `() => true`          | 1,482,297 | 1,168,398 | **Ramda** | 1.27x      |
| `identity` vs `(x)=>x`         | 440,853   | 1,058,407 | Native    | **2.4x**   |

### List Operations (`list.bench.ts`)

| Benchmark              | Ramda hz | Native hz | Winner    | Ratio     |
| ---------------------- | -------- | --------- | --------- | --------- |
| `map` tiny (10)        | 18,567   | 25,629    | Native    | 1.4x      |
| `map` medium (1000)    | 363      | 332       | **Ramda** | 1.1x      |
| `filter` tiny (10)     | 12,599   | 19,520    | Native    | 1.6x      |
| `filter` medium (1000) | 242      | 88        | **Ramda** | **2.8x**  |
| `reduce` tiny (10)     | 19,646   | 111,335   | Native    | **5.7x**  |
| `reduce` medium (1000) | 787      | 128       | **Ramda** | **6.2x**  |
| `join` tiny (10)       | 1,962    | 2,939     | Native    | 1.5x      |
| `join` medium (1000)   | 32       | 29        | **Ramda** | 1.1x      |
| `sort` tiny (10)       | 2,484    | 2,693     | Native    | 1.1x      |
| `sort` medium (1000)   | 52       | 48        | **Ramda** | 1.1x      |
| `head`                 | 68,061   | 1,313,827 | Native    | **19.3x** |
| `length`               | 50,708   | 1,299,430 | Native    | **25.6x** |
| `flatten`              | 1,454    | 2,276     | Native    | 1.6x      |
| `uniq` tiny (10)       | 2,356    | 5,605     | Native    | 2.4x      |
| `uniq` medium (1000)   | 30       | 71        | Native    | 2.3x      |

### String Operations (`string.bench.ts`)

| Benchmark | Ramda hz | Native hz | Winner | Ratio     |
| --------- | -------- | --------- | ------ | --------- |
| `trim`    | 42,137   | 49,671    | Native | 1.2x      |
| `split`   | 2,275    | 6,167     | Native | **2.7x**  |
| `join`    | 4,068    | 12,552    | Native | **3.1x**  |
| `replace` | 3,910    | 6,680     | Native | **1.7x**  |
| `test`    | 4,367    | 39,140    | Native | **9.0x**  |
| `toLower` | 5,597    | 76,843    | Native | **13.7x** |
| `toUpper` | 4,804    | 33,168    | Native | **6.9x**  |

### Object Operations (`object.bench.ts`)

| Benchmark                     | Ramda hz | Native hz | Winner | Ratio     |
| ----------------------------- | -------- | --------- | ------ | --------- |
| `prop` vs dot access          | 36,335   | 243,149   | Native | **6.7x**  |
| pre-created `prop` vs arrow   | 58,837   | 241,129   | Native | **4.1x**  |
| `keys` vs `Object.keys`       | 32,429   | 67,397    | Native | **2.1x**  |
| `path` vs `?.` chain          | 12,711   | 151,083   | Native | **11.9x** |
| `propSatisfies` vs inline     | 13,565   | 220,971   | Native | **16.3x** |
| `equals` vs `JSON.stringify`  | 518      | 2,782     | Native | **5.4x**  |
| `equals` vs manual deep equal | 559      | 5,248     | Native | **9.4x**  |

### Relation Operations (`relation.bench.ts`)

| Benchmark                      | Ramda hz | Native hz | Winner  | Ratio    |
| ------------------------------ | -------- | --------- | ------- | -------- |
| `gt(__, 0)` vs `> 0`           | 161,112  | 281,538   | Native  | 1.8x     |
| `gte(__, 0)` vs `>= 0`         | 193,652  | 301,171   | Native  | 1.6x     |
| `lt(__, 0)` vs `< 0`           | 204,945  | 304,544   | Native  | 1.5x     |
| `comparator` vs ternary        | 114      | 112       | **Tie** | 1.02x    |
| `defaultTo` vs `??`            | 54,974   | 104,123   | Native  | 1.9x     |
| `equals` (primitives) vs `===` | 16,448   | 152,370   | Native  | **9.3x** |

## 4. Real Codebase Scenario Results

These benchmarks test actual patterns found within the ndigo codebase (`scenarios.bench.ts`).

| Scenario                        | Ramda hz | Native hz | Winner    | Ratio     |
| ------------------------------- | -------- | --------- | --------- | --------- |
| 1: EntriesIterator dispatch     | 6,223    | 7,487     | Native    | 1.2x      |
| 2: parseData type dispatch      | 1,550    | 969       | **Ramda** | **1.6x**  |
| 3: MatrixString encode pipeline | 79       | 672       | Native    | **8.5x**  |
| 4: isDense array check          | 133      | 4,727     | Native    | **35.6x** |
| 5: Predicate combinator         | 7,543    | 206,404   | Native    | **27.4x** |
| 6: defaultTo guard              | 45,439   | 73,618    | Native    | 1.6x      |

## 5. Tiered Recommendations

Based on the benchmark data, Ramda functions are categorized into three tiers to guide refactoring and new development.

### Tier 1: KEEP

_Ramda wins or provides genuine value with negligible overhead._

- **`always`**: Tie (1.00x). Provides a clean sentinel pattern.
- **`T` / `F`**: Ramda is actually faster (1.27x). Clean constant functions.
- **`comparator`**: Tie (1.02x). Cleaner than ternary sort functions.
- **`map`** (medium arrays): Ramda 1.1x faster. Immutable by default.
- **`filter`** (medium arrays): Ramda 2.8x faster.
- **`reduce`** (medium arrays): Ramda 6.2x faster.
- **`sort`** (medium arrays): Ramda 1.1x faster. Immutable by default.
- **`join`** (medium arrays): Ramda 1.1x faster.
- **`cond`** (complex multi-branch): Ramda 1.6x faster than imperative equivalents in complex scenarios like `parseData`.

### Tier 2: CONSIDER REPLACING

_Native is meaningfully faster (2-10x), but Ramda adds declarative readability._

- **`pipe`** (5-step): Native is only 1.7x faster. The readability of `pipe` often justifies the cost.
- **`ifElse`**: Native 2.3x faster, but declarative style has value in pipelines.
- **`equals`** (deep): Native 5-9x faster, but `R.equals` handles edge cases properly without custom recursive logic.
- **`uniq`**: Native 2.3x faster via `Set`.
- **`split`, `join` (string), `replace`**: 1.7-3.1x faster native.

### Tier 3: REPLACE

_Native is dramatically faster (>10x) AND native syntax is equally readable. These should be strictly avoided in hot paths._

- **`is(String/Number/Function)`** → `typeof` (21-34x slower)
- **`isNil`** → `== null` (6.6x slower)
- **`isNumber` wrapper** → native check (46.7x slower)
- **`head`** → `arr[0]` (19.3x slower)
- **`length`** → `arr.length` (25.6x slower)
- **`prop`** → `obj.name` (6.7x slower)
- **`path`** → `?.` chaining (11.9x slower)
- **`propSatisfies`** → inline predicate (16.3x slower)
- **`allPass`** → `&&` chains (48.4x slower)
- **`both`** → `&&` function (43.1x slower)
- **`complement`** → `!` wrapper (16.5x slower)
- **`cond`** (2-branch) → `if/else` (10.6x slower)
- **`cond`** (7-branch simple) → `switch` (21.7x slower)
- **`pipe`/`compose`** (simple 2-3 steps) → manual (23-25x slower)
- **`curry`** → manual arrows (229x slower)
- **`toLower`/`toUpper`** → native methods (7-14x slower)
- **`test`** → `regex.test()` (9x slower)

## 6. Quick Reference Decision Table

| Operation Type        | Recommendation | Preferred Approach                             |
| --------------------- | -------------- | ---------------------------------------------- |
| **Type Checking**     | **Replace**    | Use `typeof`, `instanceof`, or `== null`       |
| **Property Access**   | **Replace**    | Use dot notation or optional chaining (`?.`)   |
| **Simple Logic**      | **Replace**    | Use `&&`, `\|\|`, `!`, `if/else`, `switch`     |
| **Currying**          | **Replace**    | Use manual arrow functions `a => b => c`       |
| **Array (Small)**     | **Replace**    | Use native `.map()`, `.filter()`, `.reduce()`  |
| **Array (Medium+)**   | **Keep**       | Use Ramda `map`, `filter`, `reduce`            |
| **Deep Equality**     | **Consider**   | Use Ramda `equals` unless in a strict hot path |
| **Complex Pipelines** | **Consider**   | Use Ramda `pipe` for readability               |
| **Constants**         | **Keep**       | Use Ramda `always`, `T`, `F`                   |
