[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-util/src](../../../README.md) / [math](../README.md) / guid

# Function: guid()

> **guid**(): `string`

Defined in: [packages/blue-util/src/math/guid.ts:22](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-util/src/math/guid.ts#lines-22)

Generates a pseudo-random Globally Unique Identifier (v4).
Since the total number of GUIDs is 2^122 the chance of generating the same value twice is negligible.

## Returns

`string`

## Example

```ts
guid();
//=> "830e9f50-ac7f-4369-a14f-ed0e62b2fa0b"
guid();
//=> "5de3d09b-e79c-4727-932b-48c49228d508"
```
