[**@ndigo/core v0.0.1**](../README.md)

***

[@ndigo/core](../README.md) / Entry

# Type Alias: Entry\<Value\>

> **Entry**\<`Value`\> = `Value` *extends* `Map`\<`unknown`, `unknown`\> ? [`MapEntry`](MapEntry.md)\<`Value`\> : `Value` *extends* `Set`\<`unknown`\> ? [`SetEntry`](SetEntry.md)\<`Value`\> : `Value` *extends* `unknown`[] ? [`ArrayEntry`](ArrayEntry.md)\<`Value`\> : `Value` *extends* `object` ? [`ObjectEntry`](ObjectEntry.md)\<`Value`\> : `never`

Represents a generic entry type, which can be an `ArrayEntry`, `MapEntry`, `ObjectEntry`, or `SetEntry`.

## Type Parameters

### Value

`Value`

The original value type from which the entry is derived.
