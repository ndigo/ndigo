[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [profile](../README.md) / ProfileTerm

# Class: ProfileTerm

A composed profile expression. Immutable; `String(term)` yields the
canonical expression string, so terms drop into `@whenProfile(...)` and
`acceptsProfiles(...)` seamlessly.

## Constructors

### Constructor

> **new ProfileTerm**(`source`, `kind`): `ProfileTerm`

#### Parameters

##### source

`string`

##### kind

[`TermKind`](../type-aliases/TermKind.md)

#### Returns

`ProfileTerm`

## Accessors

### kind

#### Get Signature

> **get** **kind**(): [`TermKind`](../type-aliases/TermKind.md)

##### Returns

[`TermKind`](../type-aliases/TermKind.md)

## Methods

### toString()

> **toString**(): `string`

The canonical expression string, e.g. `'dev & !ci'`.

#### Returns

`string`
