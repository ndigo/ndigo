[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / AsyncEnumerable

# Interface: AsyncEnumerable\<K, V\>

Defined in: packages/blue-core/src/enumerable.ts:14

## Type Parameters

### K

`K` *extends* `PropertyKey`

### V

`V`

## Methods

### entries()

> **entries**(): `AsyncIterator`\<\[`K`, `V`\]\>

Defined in: packages/blue-core/src/enumerable.ts:15

#### Returns

`AsyncIterator`\<\[`K`, `V`\]\>

***

### forEach()

> **forEach**(`callback`, `context?`): `void`

Defined in: packages/blue-core/src/enumerable.ts:16

#### Parameters

##### callback

(`value`, `key`, `list`) => `void`

##### context?

`any`

#### Returns

`void`

***

### keys()

> **keys**(): `AsyncIterator`\<`K`\>

Defined in: packages/blue-core/src/enumerable.ts:17

#### Returns

`AsyncIterator`\<`K`\>

***

### values()

> **values**(): `AsyncIterator`\<`V`\>

Defined in: packages/blue-core/src/enumerable.ts:18

#### Returns

`AsyncIterator`\<`V`\>
