[**@ndigo/core v0.0.1**](../README.md)

***

[@ndigo/core](../README.md) / evaluateProfileExpression

# Function: evaluateProfileExpression()

> **evaluateProfileExpression**(`expression`, `active`): `boolean`

Evaluates a profile expression against the active profile set.

Grammar (Spring 6.1 `Profiles`): `name` | `!expr` | `expr & expr` |
`expr | expr` | `( expr )`; `&` binds tighter than `|`. Expressions are
**parsed, never eval'd** (no eval-family; P0 D8). Malformed expressions and
runaway nesting throw `IllegalStateError` naming the expression (fail-loud —
a silently-never-matching typo would ship as a missing feature).

## Parameters

### expression

`string`

The expression to evaluate.

### active

`ReadonlySet`\<`string`\>

The active (effective) profile set.

## Returns

`boolean`

`true` when the expression matches.

## Throws

On malformed expressions or excessive nesting.

## Example

```ts
evaluateProfileExpression('prod', new Set(['prod']))          // true
evaluateProfileExpression('!dev & (test | prod)', new Set(['test'])) // true
```
