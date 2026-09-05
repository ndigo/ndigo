[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / Entries

# Type Alias: Entries\<Value\>

> **Entries**\<`Value`\> = `Value` *extends* `Map`\<`unknown`, `unknown`\> ? `MapEntries`\<`Value`\> : `Value` *extends* `Set`\<`unknown`\> ? `SetEntries`\<`Value`\> : `Value` *extends* `unknown`[] ? `ArrayEntries`\<`Value`\> : `Value` *extends* `object` ? `ObjectEntries`\<`Value`\> : `never`

Defined in: [packages/blue-core/src/iterable.ts:86](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/iterable.ts#lines-86)

Represents a generic collection of entries, which can be `MapEntries`, `SetEntries`, `ArrayEntries`, or `ObjectEntries`.

## Type Parameters

### Value

`Value`

The original value type from which the entries are derived.
