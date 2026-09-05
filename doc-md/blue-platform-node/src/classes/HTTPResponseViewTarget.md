[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / HTTPResponseViewTarget

# Class: HTTPResponseViewTarget

Defined in: [packages/blue-platform-node/src/node-view-target.ts:17](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/node-view-target.ts#lines-17)

A `ViewTarget` implementation that writes rendered view output to an HTTP
`ServerResponse`. Supports content negotiation via the `Accept` header.

## Implements

- `ViewTarget`

## Constructors

### Constructor

> **new HTTPResponseViewTarget**(`response`): `HTTPResponseViewTarget`

Defined in: [packages/blue-platform-node/src/node-view-target.ts:23](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/node-view-target.ts#lines-23)

#### Parameters

##### response

`ServerResponse`\<`IncomingMessage`\> \| `undefined`

The Node.js `ServerResponse` to write to.

#### Returns

`HTTPResponseViewTarget`

## Methods

### prepare()

> **prepare**(`route`): `Promise`\<`void`\>

Defined in: [packages/blue-platform-node/src/node-view-target.ts:28](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/node-view-target.ts#lines-28)

#### Parameters

##### route

[`Route`](#)

#### Returns

`Promise`\<`void`\>

#### Inherit Doc

#### Implementation of

`ViewTarget.prepare`

***

### commit()

> **commit**(`output`, `model`, `route`): `Promise`\<`void`\>

Defined in: [packages/blue-platform-node/src/node-view-target.ts:33](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/node-view-target.ts#lines-33)

#### Parameters

##### output

`unknown`

##### model

`unknown`

##### route

[`Route`](#)

#### Returns

`Promise`\<`void`\>

#### Inherit Doc

#### Implementation of

`ViewTarget.commit`

***

### clear()

> **clear**(): `Promise`\<`void`\>

Defined in: [packages/blue-platform-node/src/node-view-target.ts:69](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/node-view-target.ts#lines-69)

#### Returns

`Promise`\<`void`\>

#### Inherit Doc

#### Implementation of

`ViewTarget.clear`
