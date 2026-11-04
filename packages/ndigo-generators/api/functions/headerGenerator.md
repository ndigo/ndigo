[**@ndigo/generators v0.0.1**](../README.md)

***

[@ndigo/generators](../README.md) / headerGenerator

# Function: headerGenerator()

> **headerGenerator**(`tree`, `schema`): `Promise`\<`void`\>

Standardizes the top-of-file documentation block of a source file to the
Ndigo canonical shape (@module, @since,

## Parameters

### tree

`Tree`

### schema

[`HeaderGeneratorSchema`](../interfaces/HeaderGeneratorSchema.md)

## Returns

`Promise`\<`void`\>

## Author

tags). Idempotent: files
that already carry a doc block are left untouched unless --force is passed.
