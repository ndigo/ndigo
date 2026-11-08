[**@ndigo/cli v0.0.1**](../../../README.md)

***

[@ndigo/cli](../../../README.md) / [ui/install](../README.md) / InstallPlan

# Interface: InstallPlan

A resolved install plan, before any filesystem changes.

## Properties

### dependencies

> `readonly` **dependencies**: readonly `string`[]

npm dependencies required by the items.

***

### files

> `readonly` **files**: readonly [`InstallPlanFile`](InstallPlanFile.md)[]

Files to write, sorted by target.

***

### items

> `readonly` **items**: readonly [`InstallPlanItem`](InstallPlanItem.md)[]

Items in dependency-first order.

***

### source

> `readonly` **source**: `string`

Root registry source.
