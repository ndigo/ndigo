[**@ndigo/auth-server v0.0.1**](../README.md)

***

[@ndigo/auth-server](../README.md) / AuthGuardDenialOptions

# Interface: AuthGuardDenialOptions

Denial behavior overrides for [AuthRouteGuard](../classes/AuthRouteGuard.md).

## Properties

### forbiddenStatus?

> `optional` **forbiddenStatus?**: `number`

Status for insufficient roles (default `403`).

***

### unauthenticatedStatus?

> `optional` **unauthenticatedStatus?**: `number`

Status for missing/invalid credentials (default `401`).
