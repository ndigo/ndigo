[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / ConfigurableFactory

# Interface: ConfigurableFactory

Defined in: packages/blue-factory/src/factory.ts:41

## Extends

- [`HierarchicalFactory`](HierarchicalFactory.md).[`Registry`](Registry.md)

## Extended by

- [`ApplicationContext`](../../../blue-context/src/interfaces/ApplicationContext.md)

## Properties

### parent

> `readonly` **parent**: [`Factory`](Factory.md)

Defined in: packages/blue-factory/src/factory.ts:37

#### Inherited from

[`HierarchicalFactory`](HierarchicalFactory.md).[`parent`](HierarchicalFactory.md#parent)

## Methods

### getInstance()

> **getInstance**\<`T`\>(`name`): `T`

Defined in: packages/blue-factory/src/factory.ts:33

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

#### Returns

`T`

#### Inherited from

[`HierarchicalFactory`](HierarchicalFactory.md).[`getInstance`](HierarchicalFactory.md#getinstance)

***

### hasOwnValue()

> **hasOwnValue**(`name`): `boolean`

Defined in: packages/blue-factory/src/factory.ts:38

#### Parameters

##### name

`string`

#### Returns

`boolean`

#### Inherited from

[`HierarchicalFactory`](HierarchicalFactory.md).[`hasOwnValue`](HierarchicalFactory.md#hasownvalue)

***

### addProcessor()

> **addProcessor**(`processor`): `void`

Defined in: packages/blue-factory/src/factory.ts:42

#### Parameters

##### processor

[`EntryProcessor`](../type-aliases/EntryProcessor.md)

#### Returns

`void`

***

### setParent()

> **setParent**(`parent`): `void`

Defined in: packages/blue-factory/src/factory.ts:43

#### Parameters

##### parent

[`Factory`](Factory.md)

#### Returns

`void`

***

### destroyValue()

> **destroyValue**(`name`): `void`

Defined in: packages/blue-factory/src/registry.ts:8

#### Parameters

##### name

`string`

#### Returns

`void`

#### Inherited from

[`Registry`](Registry.md).[`destroyValue`](Registry.md#destroyvalue)

***

### getValue()

> **getValue**\<`T`\>(`name`): `T`

Defined in: packages/blue-factory/src/registry.ts:9

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

#### Returns

`T`

#### Inherited from

[`Registry`](Registry.md).[`getValue`](Registry.md#getvalue)

***

### hasValue()

> **hasValue**(`name`): `boolean`

Defined in: packages/blue-factory/src/registry.ts:10

#### Parameters

##### name

`string`

#### Returns

`boolean`

#### Inherited from

[`Registry`](Registry.md).[`hasValue`](Registry.md#hasvalue)

***

### setValue()

> **setValue**\<`T`\>(`name`, `value`): `void`

Defined in: packages/blue-factory/src/registry.ts:11

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

##### value

`T`

#### Returns

`void`

#### Inherited from

[`Registry`](Registry.md).[`setValue`](Registry.md#setvalue)
