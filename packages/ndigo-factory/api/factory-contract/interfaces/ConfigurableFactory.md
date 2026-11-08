[**@ndigo/factory v0.0.1**](../../README.md)

***

[@ndigo/factory](../../README.md) / [factory-contract](../README.md) / ConfigurableFactory

# Interface: ConfigurableFactory

Extends [HierarchicalFactory](HierarchicalFactory.md) and [Registry](../../registry/interfaces/Registry.md) to provide configurable factory capabilities.

## Extends

- [`HierarchicalFactory`](HierarchicalFactory.md)
- [`Registry`](../../registry/interfaces/Registry.md)

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

[`EntryProcessor`](../../entry-processor/type-aliases/EntryProcessor.md)

The entry processor to add.

#### Returns

`void`

***

### destroyValue()

#### Call Signature

> **destroyValue**\<`T`\>(`token`): `void`

Destroys a value by token.

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### token

[`ContextToken`](../../context-tokens/classes/ContextToken.md)\<`T`\>

The value token.

##### Returns

`void`

##### Inherited from

[`Registry`](../../registry/interfaces/Registry.md).[`destroyValue`](../../registry/interfaces/Registry.md#destroyvalue)

#### Call Signature

> **destroyValue**(`name`): `void`

Destroys a value by name.

##### Parameters

###### name

`string`

The value name.

##### Returns

`void`

##### Inherited from

[`Registry`](../../registry/interfaces/Registry.md).[`destroyValue`](../../registry/interfaces/Registry.md#destroyvalue)

***

### getInstance()

> **getInstance**\<`T`\>(`name`): `T`

Returns the value registered under `name`: constructor-registered
values are instantiated, while values registered as instances (or
primitives) are returned as-is, preserving identity (CF-12).

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### name

`string`

The name of the value.

#### Returns

`T`

The instance (or registered value) specified by the `name`.

#### Inherited from

[`HierarchicalFactory`](HierarchicalFactory.md).[`getInstance`](HierarchicalFactory.md#getinstance)

***

### getValue()

#### Call Signature

> **getValue**\<`T`\>(`token`): `T`

Retrieves a value by token.

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### token

[`ContextToken`](../../context-tokens/classes/ContextToken.md)\<`T`\>

The value token.

##### Returns

`T`

##### Inherited from

[`Registry`](../../registry/interfaces/Registry.md).[`getValue`](../../registry/interfaces/Registry.md#getvalue)

#### Call Signature

> **getValue**\<`T`\>(`name`): `T`

Retrieves a value by name.

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### name

`string`

The value name.

##### Returns

`T`

##### Inherited from

[`Registry`](../../registry/interfaces/Registry.md).[`getValue`](../../registry/interfaces/Registry.md#getvalue)

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

Checks for a value by token.

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### token

[`ContextToken`](../../context-tokens/classes/ContextToken.md)\<`T`\>

The value token.

##### Returns

`boolean`

##### Inherited from

[`Registry`](../../registry/interfaces/Registry.md).[`hasValue`](../../registry/interfaces/Registry.md#hasvalue)

#### Call Signature

> **hasValue**(`name`): `boolean`

Checks for a value by name.

##### Parameters

###### name

`string`

The value name.

##### Returns

`boolean`

##### Inherited from

[`Registry`](../../registry/interfaces/Registry.md).[`hasValue`](../../registry/interfaces/Registry.md#hasvalue)

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

Sets a value by token.

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### token

[`ContextToken`](../../context-tokens/classes/ContextToken.md)\<`T`\>

The value token.

###### value

`T`

The value.

##### Returns

`void`

##### Inherited from

[`Registry`](../../registry/interfaces/Registry.md).[`setValue`](../../registry/interfaces/Registry.md#setvalue)

#### Call Signature

> **setValue**\<`T`\>(`name`, `value`): `void`

Sets a value by name.

##### Type Parameters

###### T

`T` = `unknown`

##### Parameters

###### name

`string`

The value name.

###### value

`T`

The value.

##### Returns

`void`

##### Inherited from

[`Registry`](../../registry/interfaces/Registry.md).[`setValue`](../../registry/interfaces/Registry.md#setvalue)
