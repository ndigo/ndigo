[**@ndigo/oxlint-plugin v0.0.1**](../../../README.md)

***

[@ndigo/oxlint-plugin](../../../README.md) / [rules/no-signals-in-entity](../README.md) / noSignalsInEntity

# Variable: noSignalsInEntity

> `const` **noSignalsInEntity**: `object`

Reports signals imports in files that declare `@entity` classes.

## Type Declaration

### defaultOptions

> **defaultOptions**: `never`[] = `[]`

### meta

> **meta**: `object`

#### meta.docs

> `readonly` **docs**: `object`

#### meta.docs.description

> `readonly` **description**: `"Disallow @ndigo/signals imports in ORM entity files"` = `'Disallow @ndigo/signals imports in ORM entity files'`

#### meta.messages

> `readonly` **messages**: `object`

#### meta.messages.signalsInEntity

> `readonly` **signalsInEntity**: `"Do not import '@ndigo/signals' in an ORM entity file — entities describe persisted columns, not reactive state. Keep signals for component/service state (ARCHITECTURE.md §Paradigm Selection Rules)."` = `"Do not import '@ndigo/signals' in an ORM entity file — entities describe persisted columns, not reactive state. Keep signals for component/service state (ARCHITECTURE.md §Paradigm Selection Rules)."`

#### meta.schema

> `readonly` **schema**: readonly \[\] = `[]`

#### meta.type

> `readonly` **type**: `"problem"` = `'problem'`

### create()

> **create**(`context`): \{ `before?`: ; `ClassDeclaration?`: ; `ImportDeclaration?`: ; `Program:exit?`: ; \} \| \{ `before`(): `void`; `ClassDeclaration`(`node`): `void`; `ImportDeclaration`(`node`): `void`; `Program:exit`(): `void`; \}

#### Parameters

##### context

`Context`

#### Returns

\{ `before?`: ; `ClassDeclaration?`: ; `ImportDeclaration?`: ; `Program:exit?`: ; \} \| \{ `before`(): `void`; `ClassDeclaration`(`node`): `void`; `ImportDeclaration`(`node`): `void`; `Program:exit`(): `void`; \}
