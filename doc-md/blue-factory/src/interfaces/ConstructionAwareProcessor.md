[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / ConstructionAwareProcessor

# Interface: ConstructionAwareProcessor

Defined in: packages/blue-factory/src/entry-processor.ts:38

Subinterface of [EntryProcessor](../type-aliases/EntryProcessor.md) that adds a before-construction callback, and a callback after construction but before explicit properties are set.

Typically used to suppress default construction for specific values.

*Note:* This interface is mainly for internal use within the framework.

## Methods

### processAfterConstruction()

> **processAfterConstruction**\<`T`\>(`name`, `instance`): `boolean`

Defined in: packages/blue-factory/src/entry-processor.ts:49

Perform operations after the instance has constructed, but before property population occurs.

This is the ideal callback for performing custom field injection on the given instance.

The default implementation returns `true`.

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

The name of instance

##### instance

`T`

The instance without properties having been set yet.

#### Returns

`boolean`

`true` if properties should be set on the instance; `false` if property population should be skipped. Normal implementations should return `true`. Returning `false` will also prevent any subsequent ConstructionAwarePostProcessors being invoked on this instance.

***

### processBeforeConstruction()

> **processBeforeConstruction**\<`T`\>(`name`, `constructor`, `argumentsList?`): `T`

Defined in: packages/blue-factory/src/entry-processor.ts:59

Apply this EntryProcessor _before the target value gets constructed_. The returned value may be a proxy instead of the target instance, effectively supressing default construction.

The default implementation returns `null`.

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

The name of instance

##### constructor

`Function`

The constructor

##### argumentsList?

`any`[]

The list of arguments supplied to the `constructor`.

#### Returns

`T`

The instance to expose instead of a default instance, or `null` to proceed with default construction.

***

### processProperties()

> **processProperties**\<`T`\>(`properties`, `name`, `instance`): `PropertyDescriptorMap`

Defined in: packages/blue-factory/src/entry-processor.ts:69

Process the given property values before the factory applies them to the given instance.

The default implementation returns the properties as-is.

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### properties

`PropertyDescriptorMap`

The name of instance

##### name

`string`

The name of instance

##### instance

`T`

The instance without properties having been set yet.

#### Returns

`PropertyDescriptorMap`

The property values to apply to the given instance.
