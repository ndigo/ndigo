[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [property-resolver](../README.md) / ResolverOptions

# Interface: ResolverOptions

Options controlling the resolver's internal lookup strategy.

## Properties

### conversionService?

> `optional` **conversionService?**: `ConversionService`

The conversion service for typed lookups (`getPropertyAs`). Defaults to
a fresh `createConversionService()` when typed reads are used.

***

### index?

> `optional` **index?**: `"prototype"` \| `"flat"`

The lookup index to use. Defaults to the prototype chain (the
framework's historical behavior).

Divergence note (ARC-7): `prototype` (PrototypeChainIndex) keeps a live
chain — in-place edits to a captured source map are visible without a
rebuild; `flat` (FlatMergedIndex) snapshots — in-place edits stay
invisible until the next rebuild. You must use the source-registry
mutation APIs (replace/add) or `refresh()` for either index to observe
edits; the placeholder cache clears only on registry version change or
refresh, not on raw object mutation.

***

### secretDecryptor?

> `optional` **secretDecryptor?**: [`SecretDecryptor`](../../secret-cipher/interfaces/SecretDecryptor.md)

Optional at-rest secret decryption (AD-29 Wave 2). Consulted for every
resolved string value AFTER placeholder resolution and BEFORE
conversion/typed reads: `{cipher:...}` markers decrypt, everything else
passes through. The resolver passes the key path as the AAD context
(key-path AAD binding). A `SecretSchemeRegistry` is the standard
implementation; the seam is an interface so a single-cipher resolver
can be injected without the registry.
