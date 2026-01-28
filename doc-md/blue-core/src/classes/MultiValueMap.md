[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / MultiValueMap

# Class: MultiValueMap\<K, V\>

Defined in: packages/blue-core/src/collection.ts:285

Extension of the external:Map\|Map interface that stores multiple values under a single key.

## Extends

- `Map`\<`K`, `V`[]\>

## Type Parameters

### K

`K`

### V

`V`

## Constructors

### Constructor

> **new MultiValueMap**\<`K`, `V`\>(`entries?`): `MultiValueMap`\<`K`, `V`\>

Defined in: node\_modules/.pnpm/typescript@5.7.3/node\_modules/typescript/lib/lib.es2015.collection.d.ts:50

#### Parameters

##### entries?

readonly readonly \[`K`, `V`[]\][]

#### Returns

`MultiValueMap`\<`K`, `V`\>

#### Inherited from

`Map<K, V[]>.constructor`

### Constructor

> **new MultiValueMap**\<`K`, `V`\>(`iterable?`): `MultiValueMap`\<`K`, `V`\>

Defined in: node\_modules/.pnpm/typescript@5.7.3/node\_modules/typescript/lib/lib.es2015.collection.d.ts:49

#### Parameters

##### iterable?

`Iterable`\<readonly \[`K`, `V`[]\], `any`, `any`\>

#### Returns

`MultiValueMap`\<`K`, `V`\>

#### Inherited from

`Map<K, V[]>.constructor`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-core/src/collection.ts:286

##### Returns

`string`

#### Overrides

`Map.[toStringTag]`

## Methods

### add()

> **add**(`key`, `value`): `this`

Defined in: packages/blue-core/src/collection.ts:295

#### Parameters

##### key

`K`

##### value

`V`

#### Returns

`this`

this
