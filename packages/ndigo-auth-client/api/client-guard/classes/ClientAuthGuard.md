[**@ndigo/auth-client v0.0.1**](../../README.md)

***

[@ndigo/auth-client](../../README.md) / [client-guard](../README.md) / ClientAuthGuard

# Class: ClientAuthGuard

A client-side guard for the Ndigo router that enforces authentication
and authorization requirements declared via the `@authenticated` and `@authorized` decorators.

This guard prevents unauthorized access to views by checking the [AuthClient](../../client/classes/AuthClient.md)
state before allowing navigation to proceed.

## Constructors

### Constructor

> **new ClientAuthGuard**(`authClient`, `loginRedirect?`, `forbiddenRedirect?`): `ClientAuthGuard`

#### Parameters

##### authClient

[`AuthClient`](../../client/classes/AuthClient.md)

The client-side authentication manager.

##### loginRedirect?

`string` = `'/login'`

The route to redirect to if unauthenticated.

##### forbiddenRedirect?

`string` = `'/forbidden'`

The route to redirect to if unauthorized.

#### Returns

`ClientAuthGuard`

## Methods

### preNavigate()

> **preNavigate**(`handler`): `Promise`\<`string` \| `null`\>

Checks authentication and authorization requirements before navigation.

#### Parameters

##### handler

`object` \| `undefined`

The route handler object.

#### Returns

`Promise`\<`string` \| `null`\>

A redirect path if access is denied, or `null` to allow navigation.

***

### setRedirects()

> **setRedirects**(`loginRedirect`, `forbiddenRedirect`): `void`

Updates the redirect paths.

#### Parameters

##### loginRedirect

`string`

The new login redirect path.

##### forbiddenRedirect

`string`

The new forbidden redirect path.

#### Returns

`void`
