[**@ndigo/util v0.0.1**](../../README.md)

***

[@ndigo/util](../../README.md) / [env](../README.md) / isDevMode

# Function: isDevMode()

> **isDevMode**(): `boolean`

True when runtime warnings are desired: any environment except an explicit
production build. Guards against referencing `process` in environments
where it is absent (e.g. some browser/worker bundles).

## Returns

`boolean`
