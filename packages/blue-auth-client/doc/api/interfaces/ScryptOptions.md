[**@blue/auth-client v0.0.1**](../README.md)

***

[@blue/auth-client](../README.md) / ScryptOptions

# Interface: ScryptOptions

Configuration for [ScryptPasswordEncoder](../classes/ScryptPasswordEncoder.md).

Cost parameters are serialized into every hash, so a deployment can bump
them and rely on `needsRehash` to migrate stored hashes at login time.

## Properties

### keyLength?

> `optional` **keyLength?**: `number`

Derived-key length in bytes. Default `32`. Must be a positive integer.

***

### ln?

> `optional` **ln?**: `number`

scrypt CPU/memory cost exponent: `N = 2 ** ln`. Default `17`
(`N = 131072`, ~128 MiB, the OWASP-recommended floor).
Must be a positive integer.

***

### p?

> `optional` **p?**: `number`

Parallelization parameter `p`. Default `1`. Must be a positive integer.

***

### r?

> `optional` **r?**: `number`

Block-size parameter `r`. Default `8`. Must be a positive integer.

***

### saltBytes?

> `optional` **saltBytes?**: `number`

Per-user salt length in bytes. Default `16` (128 bits). Must be a
positive integer.
