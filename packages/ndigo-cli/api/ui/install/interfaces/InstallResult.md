[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [ui/install](../README.md) / InstallResult

# Interface: InstallResult

Result of applying an install plan.

## Properties

### dependencies

> `readonly` **dependencies**: readonly `string`[]

Npm dependencies required by the installed items.

***

### lockPath

> `readonly` **lockPath**: `string`

The lockfile path.

***

### unchanged

> `readonly` **unchanged**: readonly `string`[]

Files that already matched the registry content.

***

### written

> `readonly` **written**: readonly `string`[]

Files written (or that would be written in a dry run).
