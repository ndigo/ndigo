[**@ndigo/management v0.0.1**](../README.md)

***

[@ndigo/management](../README.md) / ManagementAutoConfigurationOptions

# Interface: ManagementAutoConfigurationOptions

Options for [ManagementAutoConfiguration](../classes/ManagementAutoConfiguration.md).

## Properties

### accessGuard?

> `optional` **accessGuard?**: [`RouteHandlerInterceptor`](#)

Optional access guard for the exposed management endpoints. When set,
every request to those routes must pass the guard or is denied before
the handler runs; when omitted the endpoints are **open to any
caller** (default posture — documented in the package README).

**Recommendation:** the management handlers carry no
`@authenticated`/`@authorized` metadata, so a metadata-driven guard
(e.g. the auth-server's `AuthRouteGuard`, which derives every
requirement from handler metadata) would always permit these
endpoints. Use an **unconditional** guard that checks the request
itself — a token-presence or token-adapter guard.

***

### configurationClasses?

> `optional` **configurationClasses?**: (new () => `unknown`)[]

The `@configurationProperties` classes `/configprops` enumerates
(declared keys + conversion types only — values are never read,
AD-76 D-3). The same explicit list `@ndigo/inspect` takes.

#### Returns

`unknown`

***

### exposure?

> `optional` **exposure?**: `object`

Endpoint exposure override (AD-76 D-2/D-5): wins over any
`management.endpoints.exposure` section. `include` lists the endpoint
ids to serve (`'*'` = all), `exclude` withholds; the default is
`["health", "metrics"]`.

#### exclude?

> `optional` **exclude?**: `string`[]

#### include?

> `optional` **include?**: `string`[]

***

### redactHealthErrors?

> `optional` **redactHealthErrors?**: `boolean`

Whether thrown health-indicator errors are redacted on `/health`
(AD-36 D-1). Default `true`: the status stays `DOWN` and the component
name is preserved, but the exception text is replaced with
[HEALTH\_ERROR\_REDACTED](../variables/HEALTH_ERROR_REDACTED.md) so indicator internals never reach the
wire. Set `false` to expose the raw error messages (only sensible
behind the `accessGuard`).
