[**@ndigo/oxlint-plugin v0.0.1**](../../../README.md)

***

[@ndigo/oxlint-plugin](../../../README.md) / [rules/no-string-registry-lookup](../README.md) / noStringRegistryLookup

# Variable: noStringRegistryLookup

> `const` **noStringRegistryLookup**: `object`

Reports string-keyed registry lookups — both string literals and
identifiers that resolve (within this file, lexically) to a `const` that
was initialized directly from a string literal.

Strings are invisible at compile time: a renamed or mistyped entry name
fails at dispatch, not at build. `ContextToken<T>` is the canonical
handle (ADR-34 D1); the rule points authors at it, and an oxlint-disable
comment documents intentional dynamic lookups (entry names computed from
data or re-exported constants).

Identifier resolution is deliberately conservative to stay false-positive
free:
- only local `const X = '…'` (a raw string literal initializer) is treated
  as a string lookup — `let`/`var`, token aliases, and destructured names
  are not provable and are never flagged;
- parameters, imports (incl. re-exported aliases), and any shadowing
  binding shadow an outer string `const`;
- an unresolvable identifier (e.g. an import-`*`-namespace member or a
  cross-module constant) is never assumed to be a string.

## Type Declaration

### defaultOptions

> **defaultOptions**: `never`[] = `[]`

### meta

> **meta**: `object`

#### meta.docs

> `readonly` **docs**: `object`

#### meta.docs.description

> `readonly` **description**: `"Disallow string-literal registry lookups in source files"` = `'Disallow string-literal registry lookups in source files'`

#### meta.messages

> `readonly` **messages**: `object`

#### meta.messages.preferToken

> `readonly` **preferToken**: `"String-literal registry lookup {{method}}('{{name}}') — use a ContextToken (ADR-34 D1) so renames and type errors surface at build time. For a genuinely dynamic name, keep the string and add oxlint-disable-next-line with a reason."` = `"String-literal registry lookup {{method}}('{{name}}') — use a ContextToken (ADR-34 D1) so renames and type errors surface at build time. For a genuinely dynamic name, keep the string and add oxlint-disable-next-line with a reason."`

#### meta.schema

> `readonly` **schema**: readonly \[\] = `[]`

#### meta.type

> `readonly` **type**: `"problem"` = `'problem'`

### create()

> **create**(`context`): \{ `ArrowFunctionExpression?`: ; `ArrowFunctionExpression:exit?`: ; `before?`: ; `BlockStatement?`: ; `BlockStatement:exit?`: ; `CallExpression?`: ; `CatchClause?`: ; `CatchClause:exit?`: ; `ForInStatement?`: ; `ForInStatement:exit?`: ; `ForOfStatement?`: ; `ForOfStatement:exit?`: ; `ForStatement?`: ; `ForStatement:exit?`: ; `FunctionDeclaration?`: ; `FunctionDeclaration:exit?`: ; `FunctionExpression?`: ; `FunctionExpression:exit?`: ; `ImportDeclaration?`: ; `SwitchStatement?`: ; `SwitchStatement:exit?`: ; `VariableDeclaration?`: ; \} \| \{ `ArrowFunctionExpression`(`node`): `void`; `ArrowFunctionExpression:exit`(): `void`; `before`(): `void`; `BlockStatement`(): `void`; `BlockStatement:exit`(): `void`; `CallExpression`(`node`): `void`; `CatchClause`(`node`): `void`; `CatchClause:exit`(): `void`; `ForInStatement`(): `void`; `ForInStatement:exit`(): `void`; `ForOfStatement`(): `void`; `ForOfStatement:exit`(): `void`; `ForStatement`(): `void`; `ForStatement:exit`(): `void`; `FunctionDeclaration`(`node`): `void`; `FunctionDeclaration:exit`(): `void`; `FunctionExpression`(`node`): `void`; `FunctionExpression:exit`(): `void`; `ImportDeclaration`(`node`): `void`; `SwitchStatement`(): `void`; `SwitchStatement:exit`(): `void`; `VariableDeclaration`(`node`): `void`; \}

#### Parameters

##### context

`Context`

#### Returns

\{ `ArrowFunctionExpression?`: ; `ArrowFunctionExpression:exit?`: ; `before?`: ; `BlockStatement?`: ; `BlockStatement:exit?`: ; `CallExpression?`: ; `CatchClause?`: ; `CatchClause:exit?`: ; `ForInStatement?`: ; `ForInStatement:exit?`: ; `ForOfStatement?`: ; `ForOfStatement:exit?`: ; `ForStatement?`: ; `ForStatement:exit?`: ; `FunctionDeclaration?`: ; `FunctionDeclaration:exit?`: ; `FunctionExpression?`: ; `FunctionExpression:exit?`: ; `ImportDeclaration?`: ; `SwitchStatement?`: ; `SwitchStatement:exit?`: ; `VariableDeclaration?`: ; \} \| \{ `ArrowFunctionExpression`(`node`): `void`; `ArrowFunctionExpression:exit`(): `void`; `before`(): `void`; `BlockStatement`(): `void`; `BlockStatement:exit`(): `void`; `CallExpression`(`node`): `void`; `CatchClause`(`node`): `void`; `CatchClause:exit`(): `void`; `ForInStatement`(): `void`; `ForInStatement:exit`(): `void`; `ForOfStatement`(): `void`; `ForOfStatement:exit`(): `void`; `ForStatement`(): `void`; `ForStatement:exit`(): `void`; `FunctionDeclaration`(`node`): `void`; `FunctionDeclaration:exit`(): `void`; `FunctionExpression`(`node`): `void`; `FunctionExpression:exit`(): `void`; `ImportDeclaration`(`node`): `void`; `SwitchStatement`(): `void`; `SwitchStatement:exit`(): `void`; `VariableDeclaration`(`node`): `void`; \}
