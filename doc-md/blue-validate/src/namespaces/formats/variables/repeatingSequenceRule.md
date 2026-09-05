[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-validate/src](../../../README.md) / [formats](../README.md) / repeatingSequenceRule

# Variable: repeatingSequenceRule

> `const` **repeatingSequenceRule**: `RegExp`

Defined in: [packages/blue-validate/src/formats.ts:193](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/formats.ts#lines-193)

A regular expression matching repeating sequences of characters.

## Example

```ts
repeatingSequenceRule.test('111a!'); // is true, Since we have repeating sequence '111'
repeatingSequenceRule.test('123a!'); // is false, Since we don't have a repeating sequence
```
