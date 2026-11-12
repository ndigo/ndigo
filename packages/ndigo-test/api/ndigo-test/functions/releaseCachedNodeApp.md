[**@ndigo/test v0.0.1**](../../README.md)

***

[@ndigo/test](../../README.md) / [ndigo-test](../README.md) / releaseCachedNodeApp

# Function: releaseCachedNodeApp()

> **releaseCachedNodeApp**(`sources`): `void`

Releases one cached-app reference for the given sources, closing the app
when the last reference is released.

## Parameters

### sources

`Function`[]

The sources the app was booted with.

## Returns

`void`

## Example

```ts
const app = bootNodeApp([AppConfiguration]);
releaseCachedNodeApp([AppConfiguration]);
```
