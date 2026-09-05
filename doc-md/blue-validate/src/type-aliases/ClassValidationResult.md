[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / ClassValidationResult

# Type Alias: ClassValidationResult

> **ClassValidationResult** = `object`

Defined in: [packages/blue-validate/src/decorators.ts:93](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/decorators.ts#lines-93)

The result object returned by the `validate` method on a class decorated with `@validated`.

## Properties

### isValid

> **isValid**: `boolean`

Defined in: [packages/blue-validate/src/decorators.ts:94](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/decorators.ts#lines-94)

True if all validations passed, false otherwise.

***

### failedProperties

> **failedProperties**: `Set`\<`string`\>

Defined in: [packages/blue-validate/src/decorators.ts:95](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/decorators.ts#lines-95)

A set of property names that failed validation.
