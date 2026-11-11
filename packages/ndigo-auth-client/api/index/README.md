[**@ndigo/auth-client v0.0.1**](../README.md)

***

[@ndigo/auth-client](../README.md) / index

# index

Client-side authentication: OIDC adapter and auth header interceptor.

## Classes

- [AnonymousPrincipal](classes/AnonymousPrincipal.md)
- [AuthRegistry](classes/AuthRegistry.md)
- [DefaultAuthSession](classes/DefaultAuthSession.md)
- [DefaultPrincipal](classes/DefaultPrincipal.md)
- [DelegatingPasswordEncoder](classes/DelegatingPasswordEncoder.md)
- [UnknownPasswordSchemeError](classes/UnknownPasswordSchemeError.md)

## Interfaces

- [AuthAdapter](interfaces/AuthAdapter.md)
- [AuthenticationState](interfaces/AuthenticationState.md)
- [AuthResult](interfaces/AuthResult.md)
- [AuthSession](interfaces/AuthSession.md)
- [PasswordEncoder](interfaces/PasswordEncoder.md)
- [Principal](interfaces/Principal.md)
- [SessionRecord](interfaces/SessionRecord.md)
- [SessionStore](interfaces/SessionStore.md)
- [UserRecord](interfaces/UserRecord.md)
- [UserStore](interfaces/UserStore.md)

## Variables

- [AUTH\_REQUIRED\_KEY](variables/AUTH_REQUIRED_KEY.md)
- [AUTH\_ROLES\_KEY](variables/AUTH_ROLES_KEY.md)
- [AUTH\_SCOPES\_KEY](variables/AUTH_SCOPES_KEY.md)
- [schemePrefix](variables/schemePrefix.md)

## Functions

- [authenticated](functions/authenticated.md)
- [authorized](functions/authorized.md)
- [authorizedScopes](functions/authorizedScopes.md)
- [likePrincipal](functions/likePrincipal.md)

## References

### AuthClient

Re-exports [AuthClient](../client/classes/AuthClient.md)

***

### AuthHeaderInterceptor

Re-exports [AuthHeaderInterceptor](../auth-header-interceptor/classes/AuthHeaderInterceptor.md)

***

### AuthorizationRequest

Re-exports [AuthorizationRequest](../oidc-adapter/interfaces/AuthorizationRequest.md)

***

### AuthRouteMetadata

Re-exports [AuthRouteMetadata](../client-guard/interfaces/AuthRouteMetadata.md)

***

### ClientAuthGuard

Re-exports [ClientAuthGuard](../client-guard/classes/ClientAuthGuard.md)

***

### extractAuthMetadata

Re-exports [extractAuthMetadata](../client-guard/functions/extractAuthMetadata.md)

***

### InMemoryPendingAuthorizationStore

Re-exports [InMemoryPendingAuthorizationStore](../oidc-adapter/classes/InMemoryPendingAuthorizationStore.md)

***

### InMemoryRefreshTokenStore

Re-exports [InMemoryRefreshTokenStore](../oidc-adapter/classes/InMemoryRefreshTokenStore.md)

***

### OIDCAdapter

Re-exports [OIDCAdapter](../oidc-adapter/classes/OIDCAdapter.md)

***

### OIDCAdapterConfig

Re-exports [OIDCAdapterConfig](../oidc-adapter/interfaces/OIDCAdapterConfig.md)

***

### OIDCError

Re-exports [OIDCError](../oidc-adapter/classes/OIDCError.md)

***

### OIDCErrorCode

Re-exports [OIDCErrorCode](../oidc-adapter/type-aliases/OIDCErrorCode.md)

***

### OIDCResult

Re-exports [OIDCResult](../oidc-adapter/interfaces/OIDCResult.md)

***

### PendingAuthorization

Re-exports [PendingAuthorization](../oidc-adapter/interfaces/PendingAuthorization.md)

***

### PendingAuthorizationStore

Re-exports [PendingAuthorizationStore](../oidc-adapter/interfaces/PendingAuthorizationStore.md)

***

### RefreshTokenBinding

Re-exports [RefreshTokenBinding](../oidc-adapter/interfaces/RefreshTokenBinding.md)

***

### RefreshTokenStore

Re-exports [RefreshTokenStore](../oidc-adapter/interfaces/RefreshTokenStore.md)
