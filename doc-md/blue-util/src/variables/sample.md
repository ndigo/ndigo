[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-util/src](../README.md) / sample

# Variable: sample

> `const` **sample**: `SampleFunction`

Defined in: packages/blue-util/src/list/sample.ts:29

The number of values to be sampled.

The list from which values will be sampled.

## Returns

The sampled value(s).

## Example

```ts
let list = ['a', 'b', 'c'];
sample(2, list);
//=> [ "c", "a" ]
const sampleOne = sample(1);
sampleOne(list);
//=> [ "b" ]
```
