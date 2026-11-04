[**@ndigo/core v0.0.1**](../README.md)

***

[@ndigo/core](../README.md) / Entries

# Type Alias: Entries\<Value\>

> **Entries**\<`Value`\> = `Value` *extends* `Map`\<`unknown`, `unknown`\> ? [`MapEntries`](#)\<`Value`\> : `Value` *extends* `Set`\<`unknown`\> ? [`SetEntries`](#)\<`Value`\> : `Value` *extends* `unknown`[] ? [`ArrayEntries`](#)\<`Value`\> : `Value` *extends* `object` ? [`ObjectEntries`](#)\<`Value`\> : `never`

Represents a generic collection of entries, which can be `MapEntries`, `SetEntries`, `ArrayEntries`, or `ObjectEntries`.

## Type Parameters

### Value

`Value`

The original value type from which the entries are derived.
