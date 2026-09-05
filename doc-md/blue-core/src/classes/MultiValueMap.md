[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / MultiValueMap

# Class: MultiValueMap\<K, V\>

Defined in: [packages/blue-core/src/multi-value-map.ts:8](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/multi-value-map.ts#lines-8)

Extension of the [ap\|Map](#) interface that stores multiple values under a single key.

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

Defined in: node\_modules/.pnpm/typescript@6.0.3/node\_modules/typescript/lib/lib.es2015.collection.d.ts:51

#### Parameters

##### entries?

readonly readonly \[`K`, `V`[]\][] \| `null`

#### Returns

`MultiValueMap`\<`K`, `V`\>

#### Inherited from

`Map<K, V[]>.constructor`

### Constructor

> **new MultiValueMap**\<`K`, `V`\>(`iterable?`): `MultiValueMap`\<`K`, `V`\>

Defined in: node\_modules/.pnpm/typescript@6.0.3/node\_modules/typescript/lib/lib.es2015.collection.d.ts:50

#### Parameters

##### iterable?

`Iterable`\<readonly \[`K`, `V`[]\], `any`, `any`\> \| `null`

#### Returns

`MultiValueMap`\<`K`, `V`\>

#### Inherited from

`Map<K, V[]>.constructor`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-core/src/multi-value-map.ts:12](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/multi-value-map.ts#lines-12)

The string tag for this class.

##### Returns

`string`

#### Overrides

`Map.[toStringTag]`

## Methods

### add()

> **add**(`key`, `value`): `this`

Defined in: [packages/blue-core/src/multi-value-map.ts:23](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/multi-value-map.ts#lines-23)

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

***

### remove()

> **remove**(`key`, `value`): `boolean`

Defined in: [packages/blue-core/src/multi-value-map.ts:36](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/multi-value-map.ts#lines-36)

Removes a single value from the array stored at a key.
If the array becomes empty after removal, deletes the key entirely.

#### Parameters

##### key

`K`

The key whose value should be removed.

##### value

`V`

The value to remove.

#### Returns

`boolean`

True if the value was found and removed, false otherwise.
