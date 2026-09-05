[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / ConfigurableFactory

# Interface: ConfigurableFactory

Defined in: [packages/blue-factory/src/factory.ts:85](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/factory.ts#lines-85)

Extends [HierarchicalFactory](HierarchicalFactory.md) and [Registry](Registry.md) to provide configurable factory capabilities.

## Extends

- [`HierarchicalFactory`](HierarchicalFactory.md).[`Registry`](Registry.md)

## Properties

### parent

> `readonly` **parent**: [`Factory`](Factory.md) \| `null`

Defined in: [packages/blue-factory/src/factory.ts:73](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/factory.ts#lines-73)

The parent factory in the hierarchy.

#### Inherited from

[`HierarchicalFactory`](HierarchicalFactory.md).[`parent`](HierarchicalFactory.md#parent)

## Methods

### getInstance()

> **getInstance**\<`T`\>(`name`): `T`

Defined in: [packages/blue-factory/src/factory.ts:63](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/factory.ts#lines-63)

Return an instance of the specified value.

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

The name of the value.

#### Returns

`T`

An instance of the value specified by the `name`.

#### Inherited from

[`HierarchicalFactory`](HierarchicalFactory.md).[`getInstance`](HierarchicalFactory.md#getinstance)

***

### hasOwnValue()

> **hasOwnValue**(`name`): `boolean`

Defined in: [packages/blue-factory/src/factory.ts:79](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/factory.ts#lines-79)

Determines whether this factory contains a value with the given name.

#### Parameters

##### name

`string`

The name of the value.

#### Returns

`boolean`

`true` if this factory contains the value, `false` otherwise.

#### Inherited from

[`HierarchicalFactory`](HierarchicalFactory.md).[`hasOwnValue`](HierarchicalFactory.md#hasownvalue)

***

### addProcessor()

> **addProcessor**(`processor`): `void`

Defined in: [packages/blue-factory/src/factory.ts:90](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/factory.ts#lines-90)

Adds an entry processor to the factory.

#### Parameters

##### processor

[`EntryProcessor`](../type-aliases/EntryProcessor.md)

The entry processor to add.

#### Returns

`void`

***

### setParent()

> **setParent**(`parent`): `void`

Defined in: [packages/blue-factory/src/factory.ts:95](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/factory.ts#lines-95)

Sets the parent factory.

#### Parameters

##### parent

[`Factory`](Factory.md) \| `null`

The parent factory.

#### Returns

`void`

***

### destroyValue()

#### Call Signature

> **destroyValue**\<`T`\>(`token`): `void`

Defined in: [packages/blue-factory/src/registry.ts:9](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/registry.ts#lines-9)

##### Type Parameters

###### T

`T` = `any`

##### Parameters

###### token

[`ContextToken`](../classes/ContextToken.md)\<`T`\>

##### Returns

`void`

##### Inherited from

[`Registry`](Registry.md).[`destroyValue`](Registry.md#destroyvalue)

#### Call Signature

> **destroyValue**(`name`): `void`

Defined in: [packages/blue-factory/src/registry.ts:10](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/registry.ts#lines-10)

##### Parameters

###### name

`string`

##### Returns

`void`

##### Inherited from

[`Registry`](Registry.md).[`destroyValue`](Registry.md#destroyvalue)

***

### getValue()

#### Call Signature

> **getValue**\<`T`\>(`token`): `T`

Defined in: [packages/blue-factory/src/registry.ts:11](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/registry.ts#lines-11)

##### Type Parameters

###### T

`T` = `any`

##### Parameters

###### token

[`ContextToken`](../classes/ContextToken.md)\<`T`\>

##### Returns

`T`

##### Inherited from

[`Registry`](Registry.md).[`getValue`](Registry.md#getvalue)

#### Call Signature

> **getValue**\<`T`\>(`name`): `T`

Defined in: [packages/blue-factory/src/registry.ts:12](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/registry.ts#lines-12)

##### Type Parameters

###### T

`T` = `any`

##### Parameters

###### name

`string`

##### Returns

`T`

##### Inherited from

[`Registry`](Registry.md).[`getValue`](Registry.md#getvalue)

***

### hasValue()

#### Call Signature

> **hasValue**\<`T`\>(`token`): `boolean`

Defined in: [packages/blue-factory/src/registry.ts:13](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/registry.ts#lines-13)

##### Type Parameters

###### T

`T` = `any`

##### Parameters

###### token

[`ContextToken`](../classes/ContextToken.md)\<`T`\>

##### Returns

`boolean`

##### Inherited from

[`Registry`](Registry.md).[`hasValue`](Registry.md#hasvalue)

#### Call Signature

> **hasValue**(`name`): `boolean`

Defined in: [packages/blue-factory/src/registry.ts:14](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/registry.ts#lines-14)

##### Parameters

###### name

`string`

##### Returns

`boolean`

##### Inherited from

[`Registry`](Registry.md).[`hasValue`](Registry.md#hasvalue)

***

### setValue()

#### Call Signature

> **setValue**\<`T`\>(`token`, `value`): `void`

Defined in: [packages/blue-factory/src/registry.ts:15](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/registry.ts#lines-15)

##### Type Parameters

###### T

`T` = `any`

##### Parameters

###### token

[`ContextToken`](../classes/ContextToken.md)\<`T`\>

###### value

`T`

##### Returns

`void`

##### Inherited from

[`Registry`](Registry.md).[`setValue`](Registry.md#setvalue)

#### Call Signature

> **setValue**\<`T`\>(`name`, `value`): `void`

Defined in: [packages/blue-factory/src/registry.ts:16](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/registry.ts#lines-16)

##### Type Parameters

###### T

`T` = `any`

##### Parameters

###### name

`string`

###### value

`T`

##### Returns

`void`

##### Inherited from

[`Registry`](Registry.md).[`setValue`](Registry.md#setvalue)
