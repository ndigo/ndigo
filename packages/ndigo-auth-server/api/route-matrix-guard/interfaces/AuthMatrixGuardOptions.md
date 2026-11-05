[**@ndigo/auth-server v0.0.1**](../../README.md)

***

[@ndigo/auth-server](../../README.md) / [route-matrix-guard](../README.md) / AuthMatrixGuardOptions

# Interface: AuthMatrixGuardOptions

Options for [AuthMatrixGuard](../classes/AuthMatrixGuard.md).

## Properties

### onAuthenticated?

> `readonly` `optional` **onAuthenticated?**: (`route`, `principal`, `token`) => `void`

Called with the resolved principal and the winning token so the caller can
stash it (e.g. into `request.session`) for handlers to bind. Omit for a
pure allow/deny guard.

#### Parameters

##### route

[`Route`](#)

##### principal

[`Principal`](#)

##### token

`string`

#### Returns

`void`

***

### schemes

> `readonly` **schemes**: readonly [`AuthScheme`](AuthScheme.md)[]

The schemes to try, in fallback order — explicit adapter ids only.
