[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / MultiValueMap

# Class: MultiValueMap\<K, V\>

Defined in: packages/blue-core/src/collection.ts:249

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

Defined in: node\_modules/.pnpm/typescript@5.8.3/node\_modules/typescript/lib/lib.es2015.collection.d.ts:50

#### Parameters

##### entries?

readonly readonly \[`K`, `V`[]\][]

#### Returns

`MultiValueMap`\<`K`, `V`\>

#### Inherited from

`Map<K, V[]>.constructor`

### Constructor

> **new MultiValueMap**\<`K`, `V`\>(`iterable?`): `MultiValueMap`\<`K`, `V`\>

Defined in: node\_modules/.pnpm/typescript@5.8.3/node\_modules/typescript/lib/lib.es2015.collection.d.ts:49

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

Defined in: packages/blue-core/src/collection.ts:253

The string tag for this class.

##### Returns

`string`

#### Overrides

`Map.[toStringTag]`

## Methods

### add()

> **add**(`key`, `value`): `this`

Defined in: packages/blue-core/src/collection.ts:264

Adds a value to the collection associated with the given key.
If the key does not exist, a new array is created for the value.

#### Parameters

##### key

`K`

The key to associate the value with.

##### value

`V`

The value to add.

#### Returns

`this`

This MultiValueMap instance.
