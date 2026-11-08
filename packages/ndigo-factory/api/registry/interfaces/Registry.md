[**@ndigo/factory v0.0.1**](../../README.md)

***

[@ndigo/factory](../../README.md) / [registry](../README.md) / Registry

# Interface: Registry

Interface that defines a registry for shared instances.

## Extended by

- [`ConfigurableFactory`](../../factory-contract/interfaces/ConfigurableFactory.md)

## Methods

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

#### Call Signature

> **destroyValue**(`name`): `void`

Destroys a value by name.

##### Parameters

###### name

`string`

The value name.

##### Returns

`void`

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

#### Call Signature

> **hasValue**(`name`): `boolean`

Checks for a value by name.

##### Parameters

###### name

`string`

The value name.

##### Returns

`boolean`

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
