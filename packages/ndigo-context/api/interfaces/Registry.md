[**@ndigo/context v0.0.1**](../README.md)

***

[@ndigo/context](../README.md) / Registry

# Interface: Registry

Interface that defines a registry for shared instances.

## Methods

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

#### Call Signature

> **destroyValue**(`name`): `void`

##### Parameters

###### name

`string`

##### Returns

`void`

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

#### Call Signature

> **hasValue**(`name`): `boolean`

##### Parameters

###### name

`string`

##### Returns

`boolean`

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
