[**@blue/boot v0.0.1**](../README.md)

***

[@blue/boot](../README.md) / StandardConfigFileLoader

# Class: StandardConfigFileLoader

Loads `application.json` / `application-{profile}.json` config files into a
`ConfigurableEnvironment`, orchestrated by boot AFTER profiles are applied
and BEFORE CLI/builder wiring (CLI > boot > files > env > defaults).

## Constructors

### Constructor

> **new StandardConfigFileLoader**(`options?`): `StandardConfigFileLoader`

#### Parameters

##### options?

[`ConfigFileLoaderOptions`](../interfaces/ConfigFileLoaderOptions.md) = `{}`

#### Returns

`StandardConfigFileLoader`

## Methods

### load()

> **load**(`environment`): `Promise`\<`number`\>

Loads the config files into the given environment: base file first,
then per-active-profile files (later profiles higher precedence), then
`BLUE_CONFIG_IMPORT` files. Each becomes a named source in registry
order (first = lowest precedence).

#### Parameters

##### environment

`ConfigurableEnvironment`

The environment to load into.

#### Returns

`Promise`\<`number`\>

The number of files loaded.
