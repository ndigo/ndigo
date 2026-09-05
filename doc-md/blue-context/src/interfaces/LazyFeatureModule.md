[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-context/src](../README.md) / LazyFeatureModule

# Interface: LazyFeatureModule

Defined in: [packages/blue-context/src/feature-context-mount-manager.ts:29](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/feature-context-mount-manager.ts#lines-29)

A module loaded lazily by a feature's `loader`.

## Methods

### createContext()

> **createContext**(`parent`): [`ApplicationContext`](ApplicationContext.md)

Defined in: [packages/blue-context/src/feature-context-mount-manager.ts:36](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-context/src/feature-context-mount-manager.ts#lines-36)

Creates a feature context instance from the lazy-loaded module.

#### Parameters

##### parent

[`ApplicationContext`](ApplicationContext.md)

The shell or owning parent context.

#### Returns

[`ApplicationContext`](ApplicationContext.md)

A fully configured feature context.
