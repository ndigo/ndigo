[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [environment-schema](../README.md) / ValidationResult

# Interface: ValidationResult

The structured result of validating an environment against a schema.

## Properties

### issues

> **issues**: [`EnvironmentIssue`](EnvironmentIssue.md)[]

All issues found (aggregate — validation reports everything at once).

***

### valid

> **valid**: `boolean`

Whether every resolved value satisfied the schema.
