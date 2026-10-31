[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / TrustedProxySet

# Class: TrustedProxySet

A validated trusted-proxy allowlist: IP literals and CIDR prefixes
(IPv4/IPv6), with a membership predicate. Implements `Matchable<string>`
from `@blue/core` — `matches` tests whether an address belongs to the
configured set (the value-matching half of the core matcher family; the
`PatternMatcher`/`PathMatcher`/`URLMatcher` side matches caller-supplied
patterns against values and does not fit a set that owns its entries).
Construction fails loud on malformed entries — a typo must not silently
narrow the trusted set.

## Implements

- [`Matchable`](#)\<`string`\>

## Constructors

### Constructor

> **new TrustedProxySet**(`entries?`): `TrustedProxySet`

#### Parameters

##### entries?

readonly `string`[] = `[]`

Proxy addresses/ranges, e.g. `['10.0.0.0/8', '::1']`.

#### Returns

`TrustedProxySet`

#### Throws

When an entry is not an IP literal or CIDR
(hostnames and ports are rejected — proxies must be identified by
address range), or the prefix is out of range.

## Accessors

### size

#### Get Signature

> **get** **size**(): `number`

The number of configured entries (`0` = trust nobody).

##### Returns

`number`

## Methods

### matches()

> **matches**(`address`): `boolean`

Whether the given address belongs to a trusted proxy. IPv4-mapped
IPv6 spellings compare equal to their dotted form. Non-address input
never matches.

#### Parameters

##### address

`string`

An IP literal (socket peer or header entry).

#### Returns

`boolean`

#### Implementation of

`Matchable.matches`
