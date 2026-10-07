[**@blue/boot v0.0.1**](../README.md)

***

[@blue/boot](../README.md) / ConfigurationPropertiesOptions

# Interface: ConfigurationPropertiesOptions

Options for [configurationProperties](../functions/configurationProperties.md).

## Properties

### relaxed?

> `optional` **relaxed?**: `boolean`

Enable relaxed binding: a field's declared keypath and its camelCase,
kebab-case and snake_case spellings all match the environment either
way (a camelCase field finds a kebab env key and vice versa). Off by
default — exact keypaths are the contract (AD-15 Q8).

***

### schema?

> `optional` **schema?**: `ZodObject`\<`$ZodLooseShape`, `$strip`\>

Zod schema describing the bound values (AD-34 D3). When present, the
class binds in **schema mode**: every shape key resolves
`${prefix}.${key}` from the environment, and coercion, requiredness
and defaults all come from the schema (`z.default()` replaces
`@defaultValue`; no `@property` decorators needed). A missing required
key or a failed coercion throws at boot, naming the class. Schema mode
ignores `@property`/`@defaultValue`/`@nested` decorators on the
class — the schema is the single source of truth (D3).
