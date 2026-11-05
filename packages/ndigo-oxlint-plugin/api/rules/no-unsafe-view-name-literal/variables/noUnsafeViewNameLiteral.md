[**@ndigo/oxlint-plugin v0.0.1**](../../../README.md)

***

[@ndigo/oxlint-plugin](../../../README.md) / [rules/no-unsafe-view-name-literal](../README.md) / noUnsafeViewNameLiteral

# Variable: noUnsafeViewNameLiteral

> `const` **noUnsafeViewNameLiteral**: `object`

Reports string-literal view names that their runtime guard rejects.

Only literal arguments are inspected; a dynamic expression (identifier, call,
template) is not provably a literal and is left to the runtime guard. The
check branches on the callee: `IslandView` is validated against the
custom-element grammar, while `ModelAndView` and `resolveViewName` keep the
relative-path (DSV-SEC-1) contract.

## Type Declaration

### defaultOptions

> **defaultOptions**: `never`[] = `[]`

### meta

> **meta**: `object`

#### meta.docs

> `readonly` **docs**: `object`

#### meta.docs.description

> `readonly` **description**: `"Disallow unsafe string-literal view names"` = `'Disallow unsafe string-literal view names'`

#### meta.messages

> `readonly` **messages**: `object`

#### meta.messages.invalidIslandViewName

> `readonly` **invalidIslandViewName**: `"Invalid custom-element name literal '{{name}}' for IslandView — the name must be a lowercase tag with at least one hyphen (e.g. 'todo-app') and must not be a reserved platform name. Use a valid tag name, or add oxlint-disable-next-line @ndigo/no-unsafe-view-name-literal with a reason."` = `"Invalid custom-element name literal '{{name}}' for IslandView — the name must be a lowercase tag with at least one hyphen (e.g. 'todo-app') and must not be a reserved platform name. Use a valid tag name, or add oxlint-disable-next-line @ndigo/no-unsafe-view-name-literal with a reason."`

#### meta.messages.unsafeViewName

> `readonly` **unsafeViewName**: `` "Unsafe view-name literal '{{name}}' — view names must be relative and free of absolute prefixes, `..` segments, and NUL bytes (DSV-SEC-1). Use a plain name, or add oxlint-disable-next-line @ndigo/no-unsafe-view-name-literal with a reason." `` = `` "Unsafe view-name literal '{{name}}' — view names must be relative and free of absolute prefixes, `..` segments, and NUL bytes (DSV-SEC-1). Use a plain name, or add oxlint-disable-next-line @ndigo/no-unsafe-view-name-literal with a reason." ``

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

##### CallExpression()

> **CallExpression**(`node`): `void`

###### Parameters

###### node

`CallExpression`

###### Returns

`void`

##### NewExpression()

> **NewExpression**(`node`): `void`

###### Parameters

###### node

`NewExpression`

###### Returns

`void`
