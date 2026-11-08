[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [ui/install](../README.md) / InstallOptions

# Interface: InstallOptions

Options for applying an install plan.

## Properties

### dir

> `readonly` **dir**: `string`

Application directory.

***

### dryRun?

> `readonly` `optional` **dryRun?**: `boolean`

Report actions without writing files, the lockfile, or dependencies.

***

### install?

> `readonly` `optional` **install?**: `boolean`

Install npm dependencies (default true).

***

### overwrite?

> `readonly` `optional` **overwrite?**: `boolean`

Replace files that differ from the registry content.
