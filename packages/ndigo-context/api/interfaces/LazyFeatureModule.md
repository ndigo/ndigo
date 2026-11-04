[**@ndigo/context v0.0.1**](../README.md)

***

[@ndigo/context](../README.md) / LazyFeatureModule

# Interface: LazyFeatureModule

A module loaded lazily by a feature's `loader`.

## Methods

### createContext()

> **createContext**(`parent`): [`ApplicationContext`](ApplicationContext.md)

Creates a feature context instance from the lazy-loaded module.

#### Parameters

##### parent

[`ApplicationContext`](ApplicationContext.md)

The shell or owning parent context.

#### Returns

[`ApplicationContext`](ApplicationContext.md)

A fully configured feature context.
