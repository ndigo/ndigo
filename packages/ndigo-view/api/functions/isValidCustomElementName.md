[**@ndigo/view v0.0.1**](../README.md)

***

[@ndigo/view](../README.md) / isValidCustomElementName

# Function: isValidCustomElementName()

> **isValidCustomElementName**(`name`): `boolean`

Returns whether `name` is a valid, non-reserved custom-element tag name.

The check is intentionally stricter than the platform grammar: only ASCII
names are accepted (see `customElementNamePattern`), so a
spec-valid non-ASCII component name is rejected (VIEW-6 — widen the
grammar when a real consumer needs it).

## Parameters

### name

`string`

The candidate tag name.

## Returns

`boolean`

`true` when the name may be used as a custom element tag.
