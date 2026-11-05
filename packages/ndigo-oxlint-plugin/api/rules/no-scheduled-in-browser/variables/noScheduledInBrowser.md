[**@ndigo/oxlint-plugin v0.0.1**](../../../README.md)

***

[@ndigo/oxlint-plugin](../../../README.md) / [rules/no-scheduled-in-browser](../README.md) / noScheduledInBrowser

# Variable: noScheduledInBrowser

> `const` **noScheduledInBrowser**: `object`

Reports `@ndigo/scheduler` usage alongside browser-platform imports.

Scheduling is Node-only (AD-20 D5.3): `@scheduled` throws in
environments without `process`, so a file that imports the scheduler
where browser glue is also imported is a platform-misuse smell. The rule
is a heuristic — the runtime platform guard and the documentation carry
the rest of the enforcement.

## Type Declaration

### defaultOptions

> **defaultOptions**: `never`[] = `[]`

### meta

> **meta**: `object`

#### meta.docs

> `readonly` **docs**: `object`

#### meta.docs.description

> `readonly` **description**: `"Disallow @ndigo/scheduler imports in browser-platform files"` = `'Disallow @ndigo/scheduler imports in browser-platform files'`

#### meta.messages

> `readonly` **messages**: `object`

#### meta.messages.scheduledInBrowser

> `readonly` **scheduledInBrowser**: `"Do not import '@ndigo/scheduler' in a browser-platform file — scheduled tasks run on the server only (@scheduled throws without a Node runtime; AD-20 D5). Move @scheduled classes to a Node application."` = `"Do not import '@ndigo/scheduler' in a browser-platform file — scheduled tasks run on the server only (@scheduled throws without a Node runtime; AD-20 D5). Move @scheduled classes to a Node application."`

#### meta.schema

> `readonly` **schema**: readonly \[\] = `[]`

#### meta.type

> `readonly` **type**: `"problem"` = `'problem'`

### create()

> **create**(`context`): `object`

#### Parameters

##### context

`Context`

#### Returns

`object`

##### before()

> **before**(): `void`

###### Returns

`void`

##### ImportDeclaration()

> **ImportDeclaration**(`node`): `void`

###### Parameters

###### node

`ImportDeclaration`

###### Returns

`void`

##### Program:exit()

> **Program:exit**(): `void`

###### Returns

`void`
