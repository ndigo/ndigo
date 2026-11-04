[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [ndigo-platform-node](../README.md) / TLSServerOptions

# Interface: TLSServerOptions

TLS material for the secure origin listener (AD-81).

`key`, `cert` and `ca` accept either inline PEM (detected by a
`-----BEGIN` prefix) or a filesystem path, read by the adapter at bind
time (Node's tls options take PEM content only). Present when the
origin should terminate TLS and negotiate HTTP/2; absent, the origin
stays plaintext HTTP/1.1 for the edge-terminated topology (AD-80).

## Properties

### ca?

> `optional` **ca?**: `string`

Optional CA bundle (inline PEM or path) that presented client
certificates verify against when [TLSServerOptions.clientAuth](#clientauth)
is set (REV-101); without `clientAuth` this entry has no effect —
Node never requests a client certificate on `ca` alone.

***

### cert

> **cert**: `string`

PEM certificate chain (inline) or path to the certificate file.

***

### ciphers?

> `optional` **ciphers?**: `string`

OpenSSL cipher list. Defaults to Node's baseline.

***

### clientAuth?

> `optional` **clientAuth?**: `"none"` \| `"request"` \| `"require"`

Client-certificate authentication (mutual TLS, REV-101). `'none'`
(the default) never requests a certificate; `'request'` asks for one
but admits clients that present none; `'require'` rejects connections
without a certificate that verifies against [TLSServerOptions.ca](#ca)
(Node's baseline trust store when `ca` is absent — which typically
rejects every presented certificate). Maps to Node's server-side
`requestCert` / `rejectUnauthorized` options.

***

### key

> **key**: `string`

PEM private key (inline) or path to the key file.

***

### maxConcurrentStreams?

> `optional` **maxConcurrentStreams?**: `number`

Maximum concurrent HTTP/2 streams per connection (the HTTP/2 SETTINGS
`maxConcurrentStreams` value, REV-104). Absent, Node's default
applies — which is unbounded (up to 2^32-1): a single client can open
any number of concurrent streams, each a full dispatcher request.
Set a bounded value for production (128 is the nginx default).

***

### minVersion?

> `optional` **minVersion?**: `"TLSv1.2"` \| `"TLSv1.3"`

Minimum TLS version. Defaults to Node's baseline (`TLSv1.2`).
