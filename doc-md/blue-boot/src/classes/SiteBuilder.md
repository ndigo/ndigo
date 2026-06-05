[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-boot/src](../README.md) / SiteBuilder

# Class: SiteBuilder

Defined in: packages/blue-boot/src/site-builder.ts:26

**`Experimental`**

Composes a full multi-context site from child application builders.

**This class is experimental and not yet implemented.**
The API surface documented here reflects the planned 1.0 design.
Do not use in production — the interface may change without notice.

## Example

```ts
// Planned usage (not yet functional):
SiteBuilder.create()
  .child(ApplicationBuilder.from(ShellConfig))
  .child(ApplicationBuilder.from(FeatureConfig))
  .run();
```

## Constructors

### Constructor

> **new SiteBuilder**(): `SiteBuilder`

**`Experimental`**

#### Returns

`SiteBuilder`

## Methods

### create()

> `static` **create**(): `SiteBuilder`

Defined in: packages/blue-boot/src/site-builder.ts:33

**`Experimental`**

Creates a new SiteBuilder.

#### Returns

`SiteBuilder`

A new SiteBuilder instance.

***

### child()

> **child**(`_builder`): `this`

Defined in: packages/blue-boot/src/site-builder.ts:44

**`Experimental`**

Registers a child application builder as part of the site composition.

#### Parameters

##### \_builder

[`ApplicationBuilder`](ApplicationBuilder.md)

#### Returns

`this`

This builder for chaining.

***

### run()

> **run**(...`_args`): `void`

Defined in: packages/blue-boot/src/site-builder.ts:54

**`Experimental`**

Launches all registered child contexts and mounts the site.

#### Parameters

##### \_args

...`string`[]

#### Returns

`void`
