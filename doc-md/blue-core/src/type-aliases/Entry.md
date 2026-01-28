[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / Entry

# Type Alias: Entry\<Value\>

> **Entry**\<`Value`\> = `Value` *extends* `Map`\<`unknown`, `unknown`\> ? [`MapEntry`](MapEntry.md)\<`Value`\> : `Value` *extends* `Set`\<`unknown`\> ? [`SetEntry`](SetEntry.md)\<`Value`\> : `Value` *extends* `unknown`[] ? [`ArrayEntry`](ArrayEntry.md)\<`Value`\> : `Value` *extends* `object` ? [`ObjectEntry`](ObjectEntry.md)\<`Value`\> : `never`

Defined in: packages/blue-core/src/iterable.ts:27

## Type Parameters

### Value

`Value`
