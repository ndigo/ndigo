[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [placeholder-resolver](../README.md) / resolvePlaceholders

# Function: resolvePlaceholders()

> **resolvePlaceholders**(`template`, `resolver`, `inProgress?`, `depth?`): `string`

Resolves `${key}` and `${key:default}` placeholders against a property
resolver.

Cycle guard: keys currently being resolved are tracked; re-entry throws an
`IllegalStateError` naming the cycle — a depth cap cannot catch cycles, it
only overflow-panics. `MAX_DEPTH` stays as a deliberate panic switch for
runaway non-cyclic nesting.

Unresolvable placeholders (key missing AND no inline default) pass through
literally — the de-facto escape: a `${key}` matching no property survives
reads unchanged. Required reads detect the residual by their own callers.

## Parameters

### template

`string`

The string to resolve.

### resolver

[`PropertyResolver`](../../property-resolver/interfaces/PropertyResolver.md)

The property source to resolve against.

### inProgress?

`Set`\<`string`\> = `...`

Keys currently being resolved (cycle detection).

### depth?

`number` = `0`

Current nesting depth.

## Returns

`string`

The resolved string.

## Throws

On a placeholder cycle or runaway nesting.
