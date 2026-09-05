[**BlueJS Framework v0.0.1**](../../../../../README.md)

***

[BlueJS Framework](../../../../../modules.md) / [blue-validate/src](../../../README.md) / [formats](../README.md) / ssnValidGroupsRule

# Variable: ssnValidGroupsRule

> `const` **ssnValidGroupsRule**: `RegExp`

Defined in: [packages/blue-validate/src/formats.ts:233](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/formats.ts#lines-233)

A regular expression matching SSN valid groups.

Social Security valid group numbers format per Online Account Opening (OAO).

This format excludes:
- Area group numbers (first three digits) of 000, 666, 900-999
- Group numbers of all zeroes, 000, 00, 0000
