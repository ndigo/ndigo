[**@blue/factory v0.0.1**](../README.md)

***

[@blue/factory](../README.md) / ConfigurableFactory

# Interface: ConfigurableFactory

Extends [HierarchicalFactory](HierarchicalFactory.md) and [Registry](Registry.md) to provide configurable factory capabilities.

## Extends

- [`HierarchicalFactory`](HierarchicalFactory.md).[`Registry`](Registry.md)

## Properties

### parent

> `readonly` **parent**: [`Factory`](Factory.md) \| `null`

The parent factory in the hierarchy.

#### Inherited from

[`HierarchicalFactory`](HierarchicalFactory.md).[`parent`](HierarchicalFactory.md#parent)

## Methods

### addProcessor()

> **addProcessor**(`processor`): `void`

Adds an entry processor to the factory.

#### Parameters

##### processor

[`EntryProcessor`](../type-aliases/EntryProcessor.md)

The entry processor to add.

#### Returns

`void`

***

### destroyValue()

#### Call Signature

> **destroyValue**\<`T`\>(`token`): `void`

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### token

[`ContextToken`](../classes/ContextToken.md)\<`T`\>

##### Returns

`void`

##### Inherited from

[`Registry`](Registry.md).[`destroyValue`](Registry.md#destroyvalue)

#### Call Signature

> **destroyValue**(`name`): `void`

##### Parameters

###### name

`string`

##### Returns

`void`

##### Inherited from

[`Registry`](Registry.md).[`destroyValue`](Registry.md#destroyvalue)

***

### getInstance()

> **getInstance**\<`T`\>(`name`): `T`

Return an instance of the specified value.

#### Type Parameters

##### T

`T` = `unknown`

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

### getValue()

#### Call Signature

> **getValue**\<`T`\>(`token`): `T`

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### token

[`ContextToken`](../classes/ContextToken.md)\<`T`\>

##### Returns

`T`

##### Inherited from

[`Registry`](Registry.md).[`getValue`](Registry.md#getvalue)

#### Call Signature

> **getValue**\<`T`\>(`name`): `T`

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### name

`string`

##### Returns

`T`

##### Inherited from

[`Registry`](Registry.md).[`getValue`](Registry.md#getvalue)

***

### hasOwnValue()

> **hasOwnValue**(`name`): `boolean`

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

### hasValue()

#### Call Signature

> **hasValue**\<`T`\>(`token`): `boolean`

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### token

[`ContextToken`](../classes/ContextToken.md)\<`T`\>

##### Returns

`boolean`

##### Inherited from

[`Registry`](Registry.md).[`hasValue`](Registry.md#hasvalue)

#### Call Signature

> **hasValue**(`name`): `boolean`

##### Parameters

###### name

`string`

##### Returns

`boolean`

##### Inherited from

[`Registry`](Registry.md).[`hasValue`](Registry.md#hasvalue)

***

### setParent()

> **setParent**(`parent`): `void`

Sets the parent factory.

#### Parameters

##### parent

[`Factory`](Factory.md) \| `null`

The parent factory.

#### Returns

`void`

***

### setValue()

#### Call Signature

> **setValue**\<`T`\>(`token`, `value`): `void`

##### Type Parameters

###### T

`T` = `unknown`

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

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### name

`string`

###### value

`T`

##### Returns

`void`

##### Inherited from

[`Registry`](Registry.md).[`setValue`](Registry.md#setvalue)
