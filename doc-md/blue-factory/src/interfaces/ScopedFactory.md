[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / ScopedFactory

# Interface: ScopedFactory

Defined in: [packages/blue-factory/src/scope.ts:17](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/scope.ts#lines-17)

## Methods

### destroyScopedValue()

> **destroyScopedValue**(`scopeName`, `valueName`): `void`

Defined in: [packages/blue-factory/src/scope.ts:18](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/scope.ts#lines-18)

#### Parameters

##### scopeName

`string`

##### valueName

`string`

#### Returns

`void`

***

### getScope()

> **getScope**(`name`): [`Scope`](Scope.md)

Defined in: [packages/blue-factory/src/scope.ts:19](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/scope.ts#lines-19)

#### Parameters

##### name

`string`

#### Returns

[`Scope`](Scope.md)

***

### getScopeNames()

> **getScopeNames**(): `string`[]

Defined in: [packages/blue-factory/src/scope.ts:20](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/scope.ts#lines-20)

#### Returns

`string`[]

***

### registerScope()

> **registerScope**(`name`, `scope`): `void`

Defined in: [packages/blue-factory/src/scope.ts:21](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/scope.ts#lines-21)

#### Parameters

##### name

`string`

##### scope

[`Scope`](Scope.md)

#### Returns

`void`
