---
rule: '@ndigo/no-string-token-lookup'
severity: error
recommended: true
since: 0.0.1
---

# no-string-token-lookup

A registry lookup passes a string literal where a `ContextToken` belongs.

## What it reports

`preferToken` — reported on the lookup call:

```ts
const db = context.getValue('dataSource');
const cache = context.hasValue('cacheManager');
```

The rule covers the read side — `getValue`, `getInstance`, `hasValue`,
`destroyValue` — and also catches an identifier that is provably bound to a
string literal in the same scope:

```ts
const KEY = 'dataSource';
context.getValue(KEY); // reported
```

An identifier of unknown value (an import, a parameter, a `let`, a
cross-module constant) is **not** reported: the rule never guesses.

## Why

A string lookup is resolved at runtime. Rename the registration and the lookup
silently misses; a typo produces `undefined` instead of a type error. A
`ContextToken` carries the value type, so both failures move to build time.

Registration through `setValue` stays string-legal — strings and tokens share
the description-keyed registry — so the rule only touches reads.

## How to fix

Define a token next to the contract and use it on both sides:

```ts
import { ContextToken } from '@ndigo/context';

export const DATA_SOURCE_TOKEN = new ContextToken<DataSource>('dataSource');
```

```ts
context.setValue(DATA_SOURCE_TOKEN, dataSource);
const db = context.getValue(DATA_SOURCE_TOKEN);
```

## Options

None.

## When to disable

Legitimate only when the key is genuinely dynamic — for example a fallback path
that reads a registration whose name is computed at runtime. Keep the reason in
the disable comment, and prefer making the key static if you can.
