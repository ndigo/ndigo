[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [remote-property-source](../README.md) / RemoteSourceOptions

# Interface: RemoteSourceOptions

Options accepted by [RemotePropertySource](../classes/RemotePropertySource.md).

## Properties

### fetch?

> `optional` **fetch?**: \{(`input`, `init?`): `Promise`\<`Response`\>; (`input`, `init?`): `Promise`\<`Response`\>; \}

The fetch implementation (injectable seam for specs / non-fetch
runtimes). Defaults to `globalThis.fetch`. Injecting a fetch skips the
`https:` scheme check — the seam owns the transport then.

#### Call Signature

> (`input`, `init?`): `Promise`\<`Response`\>

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/fetch)

##### Parameters

###### input

`RequestInfo` \| `URL`

###### init?

`RequestInit`

##### Returns

`Promise`\<`Response`\>

#### Call Signature

> (`input`, `init?`): `Promise`\<`Response`\>

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Window/fetch)

##### Parameters

###### input

`string` \| `Request` \| `URL`

###### init?

`RequestInit`

##### Returns

`Promise`\<`Response`\>

***

### fetchTimeoutMs?

> `optional` **fetchTimeoutMs?**: `number`

Timeout for one fetch exchange (request + body read) in milliseconds
(default `10_000`). On expiry the request is aborted and the failure
follows the standard `optional`/keep-last-good policy (SE-10).

***

### headers?

> `optional` **headers?**: `Record`\<`string`, `string`\>

Static headers sent on every request (e.g.
`Authorization: Bearer …` sourced from env at the wiring site).

***

### maxResponseBytes?

> `optional` **maxResponseBytes?**: `number`

Maximum accepted response size in bytes (default 1 MiB). Enforced
against `Content-Length` when the server declares one, then by
counting streamed bytes; an oversized document follows the standard
`optional`/keep-last-good policy (SE-10).

***

### optional?

> `optional` **optional?**: `boolean`

`true` (default) — fetch failure warns and boot proceeds; `false` —
first fetch failure throws (boot fails loudly naming the URL).

***

### pollMs?

> `optional` **pollMs?**: `number`

Polling interval in milliseconds. `0`/absent = fetch once at load,
no polling.

***

### scheduler?

> `optional` **scheduler?**: [`RemoteSourceScheduler`](RemoteSourceScheduler.md)

The poll scheduler seam. Defaults to `globalThis.setInterval`/`clearInterval`.

***

### url

> **url**: `string`

The remote configuration URL. Required; when using the default fetch,
the scheme is validated at construction and must be `https:`.
