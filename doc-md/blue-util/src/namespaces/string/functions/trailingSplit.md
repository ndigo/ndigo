[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [string](../README.md) / trailingSplit

# Function: trailingSplit()

## Call Signature

> **trailingSplit**(`separator`, `text`): `string`[]

Defined in: [packages/blue-util/src/string/trailing-split.ts:18](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-util/src/string/trailing-split.ts#lines-18)

Splits a string into an array of strings based on the given separator.

### Parameters

#### separator

`string`

#### text

`string`

### Returns

`string`[]

### Example

```ts
const trailingSplitOnPipe = trailingSplit( "|" );
trailingSplitOnPipe( "a|b|c|" );
//=> [ "a", "b", "c" ]
trailingSplit( ",", "a,b,c," );
//=> [ "a", "b", "c" ]
```

## Call Signature

> **trailingSplit**(`separator`): (`text`) => `string`[]

Defined in: [packages/blue-util/src/string/trailing-split.ts:19](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-util/src/string/trailing-split.ts#lines-19)

Splits a string into an array of strings based on the given separator.

### Parameters

#### separator

`string`

### Returns

(`text`) => `string`[]

### Example

```ts
const trailingSplitOnPipe = trailingSplit( "|" );
trailingSplitOnPipe( "a|b|c|" );
//=> [ "a", "b", "c" ]
trailingSplit( ",", "a,b,c," );
//=> [ "a", "b", "c" ]
```
