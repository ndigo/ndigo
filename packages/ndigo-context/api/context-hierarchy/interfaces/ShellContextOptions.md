[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [context-hierarchy](../README.md) / ShellContextOptions

# Interface: ShellContextOptions

Options for creating a shell context.

## Properties

### contentSource?

> `optional` **contentSource?**: [`ContentSource`](#)

Overrides the shell content source.

***

### data?

> `optional` **data?**: `JSONObject`

Initial values to populate the context with.

***

### environment?

> `optional` **environment?**: [`ConfigurableEnvironment`](../../environment/interfaces/ConfigurableEnvironment.md)

Overrides the shell environment.

***

### name?

> `optional` **name?**: `string`

Optional shell context name.

***

### themeName?

> `optional` **themeName?**: `string`

Sets the default theme name.

***

### themeResolver?

> `optional` **themeResolver?**: `ThemeResolver`

Overrides the shell theme resolver.
