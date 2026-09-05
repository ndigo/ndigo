[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / Registry

# Interface: Registry

Defined in: [packages/blue-factory/src/registry.ts:8](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/registry.ts#lines-8)

## Extended by

- [`ConfigurableFactory`](ConfigurableFactory.md)

## Methods

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

#### Call Signature

> **destroyValue**(`name`): `void`

Defined in: [packages/blue-factory/src/registry.ts:10](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/registry.ts#lines-10)

##### Parameters

###### name

`string`

##### Returns

`void`

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

#### Call Signature

> **hasValue**(`name`): `boolean`

Defined in: [packages/blue-factory/src/registry.ts:14](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/registry.ts#lines-14)

##### Parameters

###### name

`string`

##### Returns

`boolean`

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
