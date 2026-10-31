[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / SecretMarker

# Interface: SecretMarker

A parsed secret marker.

## Properties

### payload

> `readonly` **payload**: `string`

The scheme-specific payload (everything after scheme[:version]:).

***

### scheme

> `readonly` **scheme**: `string`

The scheme id (`cipher`, `jwe`, …) — dispatch key into the scheme registry.

***

### version

> `readonly` **version**: `string` \| `null`

The format version (`v1`), or `null` when the scheme carries none.
