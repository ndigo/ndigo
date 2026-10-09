[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / TLSServerOptions

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

Optional additional CA bundle (inline PEM or path) for client-certificate chains.

***

### cert

> **cert**: `string`

PEM certificate chain (inline) or path to the certificate file.

***

### ciphers?

> `optional` **ciphers?**: `string`

OpenSSL cipher list. Defaults to Node's baseline.

***

### key

> **key**: `string`

PEM private key (inline) or path to the key file.

***

### minVersion?

> `optional` **minVersion?**: `"TLSv1.2"` \| `"TLSv1.3"`

Minimum TLS version. Defaults to Node's baseline (`TLSv1.2`).
