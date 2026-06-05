[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / Entry

# Type Alias: Entry\<Value\>

> **Entry**\<`Value`\> = `Value` *extends* `Map`\<`unknown`, `unknown`\> ? [`MapEntry`](MapEntry.md)\<`Value`\> : `Value` *extends* `Set`\<`unknown`\> ? [`SetEntry`](SetEntry.md)\<`Value`\> : `Value` *extends* `unknown`[] ? [`ArrayEntry`](ArrayEntry.md)\<`Value`\> : `Value` *extends* `object` ? [`ObjectEntry`](ObjectEntry.md)\<`Value`\> : `never`

Defined in: packages/blue-core/src/iterable.ts:71

Represents a generic entry type, which can be an `ArrayEntry`, `MapEntry`, `ObjectEntry`, or `SetEntry`.

## Type Parameters

### Value

`Value`

The original value type from which the entry is derived.
