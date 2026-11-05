[**@ndigo/oxlint-plugin v0.0.1**](../../../README.md)

***

[@ndigo/oxlint-plugin](../../../README.md) / [rules/no-raw-console](../README.md) / noRawConsole

# Variable: noRawConsole

> `const` **noRawConsole**: `object`

Reports raw `console.warn`/`console.error`/`console.log` call sites in
package source.

The framework logs through `@ndigo/log` so every record follows the
configured logger (console bridge or OpenTelemetry) and carries trace
context. Raw console calls bypass that pipeline, so they are banned in
`packages/ndigo-<name>/src` — except in `@ndigo/log` (the bridge itself) and
`@ndigo/util` (the documented leaf exception). Specs and test files are out
of scope (they legitimately spy on the console).

## Type Declaration

### defaultOptions

> **defaultOptions**: `never`[] = `[]`

### meta

> **meta**: `object`

#### meta.docs

> `readonly` **docs**: `object`

#### meta.docs.description

> `readonly` **description**: `"Disallow raw console.warn/console.error/console.log calls in package source"` = `'Disallow raw console.warn/console.error/console.log calls in package source'`

#### meta.messages

> `readonly` **messages**: `object`

#### meta.messages.rawConsole

> `readonly` **rawConsole**: `` "Raw `console.{{method}}` is not allowed in package source — log through `@ndigo/log` (`getLogger('…')`) instead. Only `@ndigo/log` (the console bridge) and `@ndigo/util` (documented leaf exception) may touch the console directly." `` = `` "Raw `console.{{method}}` is not allowed in package source — log through `@ndigo/log` (`getLogger('…')`) instead. Only `@ndigo/log` (the console bridge) and `@ndigo/util` (documented leaf exception) may touch the console directly." ``

#### meta.schema

> `readonly` **schema**: readonly \[\] = `[]`

#### meta.type

> `readonly` **type**: `"problem"` = `'problem'`

### create()

> **create**(`context`): \{ `CallExpression?`: ; \} \| \{ `CallExpression`(`node`): `void`; \}

#### Parameters

##### context

`Context`

#### Returns

\{ `CallExpression?`: ; \} \| \{ `CallExpression`(`node`): `void`; \}
