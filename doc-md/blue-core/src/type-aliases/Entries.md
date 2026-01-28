[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / Entries

# Type Alias: Entries\<Value\>

> **Entries**\<`Value`\> = `Value` *extends* `Map`\<`unknown`, `unknown`\> ? `MapEntries`\<`Value`\> : `Value` *extends* `Set`\<`unknown`\> ? `SetEntries`\<`Value`\> : `Value` *extends* `unknown`[] ? `ArrayEntries`\<`Value`\> : `Value` *extends* `object` ? `ObjectEntries`\<`Value`\> : `never`

Defined in: packages/blue-core/src/iterable.ts:38

## Type Parameters

### Value

`Value`
