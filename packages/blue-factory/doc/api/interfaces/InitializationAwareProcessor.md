[**@blue/factory v0.0.1**](../README.md)

***

[@blue/factory](../README.md) / InitializationAwareProcessor

# Interface: InitializationAwareProcessor

## Methods

### processAfterInitialization()

> **processAfterInitialization**\<`T`\>(`name`, `instance`): `T`

Apply this [EntryProcessor](../type-aliases/EntryProcessor.md) to the given new instance _before_ any initialization callbacks. The instance will already be populated with property values. The returned instance may be a wrapper around the original.

The default implementation returns the given instance as-is.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### name

`string`

The name of instance

##### instance

`T`

The instance

#### Returns

`T`

The instance to use, either the original or a wrapped one; if `null`, no subsequent EntryProcessors will be invoked.

***

### processBeforeInitialization()

> **processBeforeInitialization**\<`T`\>(`name`, `instance`): `T`

Apply this [EntryProcessor](../type-aliases/EntryProcessor.md) to the given new instance _after_ any initialization callbacks. The instance will already be populated with property values. The returned instance may be a wrapper around the original.

The default implementation returns the given instance as-is.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### name

`string`

The name of instance

##### instance

`T`

The instance

#### Returns

`T`

The instance to use, either the original or a wrapped one; if `null`, no subsequent EntryProcessors will be invoked.
