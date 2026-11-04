[**@ndigo/auth-server v0.0.1**](../README.md)

***

[@ndigo/auth-server](../README.md) / AuthScheme

# Interface: AuthScheme

One authentication scheme: an explicit adapter id plus a function that pulls
that scheme's raw credential off the route. The guard tries the schemes in
declaration order and validates the first non-empty credential it finds — so
a single route can accept, say, a session cookie AND a `Bearer` token without
either being validated against the wrong adapter.

## Properties

### adapterId

> `readonly` **adapterId**: `string`

The explicit adapter id this scheme's credential is validated against.

***

### extract

> `readonly` **extract**: (`route`) => `string` \| `null`

Extracts this scheme's raw credential from the route, or `null`/'' when absent.

#### Parameters

##### route

[`Route`](#)

#### Returns

`string` \| `null`
