[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / EnvironmentCustomizer

# Interface: EnvironmentCustomizer

Ordered hook that adjusts the environment after the standard sources are
wired and before the context reads it (AD-16 D2 — Spring's
`EnvironmentPostProcessor` analog, house-named `EnvironmentCustomizer`).

Customizers run in registration order; a throwing customizer fails boot
loudly (a partial environment would poison later reads).

## Methods

### customize()

> **customize**(`environment`): `void`

Adjusts the fully-prepared environment: reorder/replace sources via
`getPropertySources()`, inject test doubles, or add a custom source.

#### Parameters

##### environment

[`ConfigurableEnvironment`](ConfigurableEnvironment.md)

The prepared environment (profiles, files, CLI,
  builder already applied).

#### Returns

`void`
