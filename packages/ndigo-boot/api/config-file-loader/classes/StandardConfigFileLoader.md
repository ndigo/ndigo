[**@ndigo/boot v0.0.1**](../../README.md)

***

[@ndigo/boot](../../README.md) / [config-file-loader](../README.md) / StandardConfigFileLoader

# Class: StandardConfigFileLoader

Loads `application.json` / `application-{profile}.json` (and, when
`format` is `'auto'` or `'toon'`, `application.toon` /
`application-{profile}.toon` — JSON wins the collision) config files into
a `ConfigurableEnvironment`, orchestrated by boot AFTER profiles are
applied and BEFORE CLI/builder wiring (CLI \> boot \> files \> env \>
defaults). See AD-66: TOON is an opt-in, decode-only authoring format;
JSON stays the default.

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
`NDIGO_CONFIG_IMPORT` files. Each becomes a named source in registry
order (first = lowest precedence).

#### Parameters

##### environment

`ConfigurableEnvironment`

The environment to load into.

#### Returns

`Promise`\<`number`\>

The number of files loaded.
