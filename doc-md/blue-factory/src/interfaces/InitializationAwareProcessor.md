[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / InitializationAwareProcessor

# Interface: InitializationAwareProcessor

Defined in: [packages/blue-factory/src/entry-processor.ts:10](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/entry-processor.ts#lines-10)

## Methods

### processAfterInitialization()

> **processAfterInitialization**\<`T`\>(`name`, `instance`): `T`

Defined in: [packages/blue-factory/src/entry-processor.ts:19](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/entry-processor.ts#lines-19)

Apply this [EntryProcessor](../type-aliases/EntryProcessor.md) to the given new instance _before_ any initialization callbacks. The instance will already be populated with property values. The returned instance may be a wrapper around the original.

The default implementation returns the given instance as-is.

#### Type Parameters

##### T

`T` = `any`

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

Defined in: [packages/blue-factory/src/entry-processor.ts:28](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/entry-processor.ts#lines-28)

Apply this [EntryProcessor](../type-aliases/EntryProcessor.md) to the given new instance _after_ any initialization callbacks. The instance will already be populated with property values. The returned instance may be a wrapper around the original.

The default implementation returns the given instance as-is.

#### Type Parameters

##### T

`T` = `any`

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
