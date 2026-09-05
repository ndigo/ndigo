[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-validate/src](../../../README.md) / [formats](../README.md) / CurrencyFormat

# Type Alias: CurrencyFormat

> **CurrencyFormat** = `object`

Defined in: [packages/blue-validate/src/formats.ts:14](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/formats.ts#lines-14)

Defines the structure for a currency format, including symbols, delimiters, and regex patterns.

## Properties

### decimal

> **decimal**: `string`

Defined in: [packages/blue-validate/src/formats.ts:15](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/formats.ts#lines-15)

The character used for the decimal separator (e.g., '.').

***

### decimalDigits

> **decimalDigits**: `number`

Defined in: [packages/blue-validate/src/formats.ts:16](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/formats.ts#lines-16)

The number of digits expected after the decimal point.

***

### kDelim

> **kDelim**: `string`

Defined in: [packages/blue-validate/src/formats.ts:17](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/formats.ts#lines-17)

The character used for the thousands delimiter (e.g., ',').

***

### symbol

> **symbol**: `string`

Defined in: [packages/blue-validate/src/formats.ts:18](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/formats.ts#lines-18)

The currency symbol (e.g., '$').

***

### symbolBegin

> **symbolBegin**: `boolean`

Defined in: [packages/blue-validate/src/formats.ts:19](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/formats.ts#lines-19)

True if the symbol appears before the amount, false otherwise.

***

### regex

> **regex**: `RegExp`

Defined in: [packages/blue-validate/src/formats.ts:20](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/formats.ts#lines-20)

A regular expression to validate the currency format.
