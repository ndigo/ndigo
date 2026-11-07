[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [multi-value-map](../README.md) / MultiValueMap

# Class: MultiValueMap\<K, V\>

Extension of the `Map` interface that stores multiple values under a single key.

## Example

```ts
const map = new MultiValueMap<string, number>();
map.add('a', 1);
map.add('a', 2);
map.get('a'); // [1, 2]
```

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

#### Parameters

##### entries?

readonly (readonly \[`K`, `V`[]\])[] \| `null`

#### Returns

`MultiValueMap`\<`K`, `V`\>

#### Inherited from

`Map<K, V[]>.constructor`

### Constructor

> **new MultiValueMap**\<`K`, `V`\>(`iterable?`): `MultiValueMap`\<`K`, `V`\>

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

The string tag for this class.

##### Returns

`string`

#### Overrides

`Map.[toStringTag]`

## Methods

### add()

> **add**(`key`, `value`): `this`

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
