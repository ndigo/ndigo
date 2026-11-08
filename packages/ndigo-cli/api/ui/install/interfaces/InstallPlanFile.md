[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [ui/install](../README.md) / InstallPlanFile

# Interface: InstallPlanFile

One file in an install plan.

## Properties

### content

> `readonly` **content**: `string`

File body.

***

### item

> `readonly` **item**: `string`

Item that declared the file.

***

### sha256

> `readonly` **sha256**: `string`

SHA-256 of the body, recorded in the lockfile.

***

### target

> `readonly` **target**: `string`

Application-relative target path.
