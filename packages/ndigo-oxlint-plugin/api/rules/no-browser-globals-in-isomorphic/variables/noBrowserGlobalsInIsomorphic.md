[**@ndigo/oxlint-plugin v0.0.1**](../../../README.md)

***

[@ndigo/oxlint-plugin](../../../README.md) / [rules/no-browser-globals-in-isomorphic](../README.md) / noBrowserGlobalsInIsomorphic

# Variable: noBrowserGlobalsInIsomorphic

> `const` **noBrowserGlobalsInIsomorphic**: `object`

Reports unguarded access to browser globals in isomorphic packages.

## Type Declaration

### defaultOptions

> **defaultOptions**: `never`[] = `[]`

### meta

> **meta**: `object`

#### meta.docs

> `readonly` **docs**: `object`

#### meta.docs.description

> `readonly` **description**: `"Disallow unguarded access to browser globals in isomorphic packages"` = `'Disallow unguarded access to browser globals in isomorphic packages'`

#### meta.messages

> `readonly` **messages**: `object`

#### meta.messages.browserGlobal

> `readonly` **browserGlobal**: `` "'{{name}}' is a browser global. Guard with `typeof {{name}} !== 'undefined'` or move to @ndigo/platform-web." `` = `` "'{{name}}' is a browser global. Guard with `typeof {{name}} !== 'undefined'` or move to @ndigo/platform-web." ``

#### meta.schema

> `readonly` **schema**: readonly \[\] = `[]`

#### meta.type

> `readonly` **type**: `"problem"` = `'problem'`

### create()

> **create**(`context`): \{ `before?`: ; `Identifier?`: ; \} \| \{ `before`(): `void`; `Identifier`(`node`): `void`; \}

#### Parameters

##### context

`Context`

#### Returns

\{ `before?`: ; `Identifier?`: ; \} \| \{ `before`(): `void`; `Identifier`(`node`): `void`; \}
