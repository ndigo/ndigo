[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [http-shared](../README.md) / freeze

# Variable: freeze

> **freeze**: \{\<`T`\>(`f`): `T`; \<`T`, `U`\>(`o`): `Readonly`\<`T`\>; \<`T`\>(`o`): `Readonly`\<`T`\>; \}

## Call Signature

> \<`T`\>(`f`): `T`

Prevents the modification of existing property attributes and values, and prevents the addition of new properties.

### Type Parameters

#### T

`T` *extends* `Function`

### Parameters

#### f

`T`

Object on which to lock the attributes.

### Returns

`T`

## Call Signature

> \<`T`, `U`\>(`o`): `Readonly`\<`T`\>

Prevents the modification of existing property attributes and values, and prevents the addition of new properties.

### Type Parameters

#### T

`T` *extends* `object`

#### U

`U` *extends* `string` \| `number` \| `bigint` \| `boolean` \| `symbol`

### Parameters

#### o

`T`

Object on which to lock the attributes.

### Returns

`Readonly`\<`T`\>

## Call Signature

> \<`T`\>(`o`): `Readonly`\<`T`\>

Prevents the modification of existing property attributes and values, and prevents the addition of new properties.

### Type Parameters

#### T

`T`

### Parameters

#### o

`T`

Object on which to lock the attributes.

### Returns

`Readonly`\<`T`\>
