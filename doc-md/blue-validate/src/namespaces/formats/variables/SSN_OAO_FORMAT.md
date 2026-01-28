[**BlueJS Framework v3.0.0-alpha.0**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-validate/src](../../../README.md) / [formats](../README.md) / SSN\_OAO\_FORMAT

# Variable: SSN\_OAO\_FORMAT

> `const` **SSN\_OAO\_FORMAT**: `RegExp`

Defined in: packages/blue-validate/src/formats.ts:234

A regular expression matching SSN OAO Format.

Social Security number format per Online Account Opening (OAO).

This format excludes:
- Area group numbers (first three digits) of 000, 666, 900-999
- 123456789 and 123-45-6789
- Any SSN where all digits are the same digit, 111-11-1111, 222-22-2222, ...
- Group numbers of all zeroes, 000, 00, 0000

## Constant

module:validate.formats.SSN_OAO_FORMAT
