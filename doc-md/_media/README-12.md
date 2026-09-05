# @blue/parser

Parser combinators and string processing utilities for the BlueJS framework.

## Overview

`@blue/parser` provides:

- **Glob pattern matching** with brace expansion (`{a,b}`, `{1..10}`)
- **Extended glob support** (`@()`, `*()`, `?()`, `+()`, `!()`)
- **Keypath expression parsing** for nested object access
- **Re-exported parsers** from [arcsecond](https://github.com/francisrstokes/arcsecond) for building custom parsers

## Installation

```bash
pnpm add @blue/parser
```

## Usage

### Brace Expansion

```typescript
import { braceExpression } from '@blue/parser';

const result = braceExpression.run('file{1..3}.txt');
// result.result => ['file1.txt', 'file2.txt', 'file3.txt']

const nested = braceExpression.run('a{b,{c,d}}e');
// nested.result => ['abe', 'ace', 'ade']
```

### Glob Patterns

```typescript
import { glob } from '@blue/parser';

const pattern = glob.run('src/**/*.{js,ts}');
// Matches: src/utils/helper.js, src/components/Button.ts, etc.
```

### Keypath Expressions

```typescript
import { keypathExpression } from '@blue/parser';

const path = keypathExpression.run('user.address.city');
// Parses nested object paths
```

## Public API

All public exports are defined in [`src/index.ts`](./src/index.ts):

| Export               | Type       | Description                                                    |
| :------------------- | :--------- | :------------------------------------------------------------- |
| `braceExpression`    | Parser     | Bash-style brace expansion                                     |
| `glob`               | Parser     | Standard glob pattern matching                                 |
| `keypathExpression`  | Parser     | Nested object path parsing                                     |
| `sequenceExpression` | Parser     | Numeric/alphabetic sequences                                   |
| `wildcardExpression` | Parser     | Simple wildcard patterns                                       |
| `posixClass`         | Parser     | POSIX character classes `[:alpha:]`                            |
| `manyN`              | Combinator | Match at least N occurrences                                   |
| `sepByN`             | Combinator | Match N+ separated values                                      |
| `noop`               | Parser     | No-op parser (identity)                                        |
| **[arcsecond]**      | Re-exports | Core parser combinators (`char`, `choice`, `sequenceOf`, etc.) |

## Internal Modules

The following files are **internal implementation details** and not part of the public API:

- **`src/_util.ts`** - Internal utility re-exports from `@blue/util` (Ramda functions, list operations)
- **`src/_parser.ts`** - Low-level parser primitives used by public parsers
- **`test/_expect.ts`** - Test helper utilities for parser validation

❌ **Do not import these files directly** - they are subject to change without notice.

## Testing

```bash
# Run all parser tests
pnpm test

# Run specific test suite
pnpm vitest run test/brace-expression.spec.ts
```

## Architecture

This package follows the [BlueJS Architecture](../../ARCHITECTURE.md) as a **Layer 1: Support** package, providing foundational parsing capabilities used by higher-level framework components.

## Contributing

See [AGENTS.md](../../AGENTS.md) for development guidelines and conventions.

## License

ISC © BlueJS Team
