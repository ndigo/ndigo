[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / SharedOptions

# Interface: SharedOptions

Options for the `@sharedDependency` class decorator.

## Properties

### singleton?

> `optional` **singleton?**: `boolean`

Whether this entry must be a singleton across the context hierarchy. Default `true`.

***

### version?

> `optional` **version?**: `string`

Semver range for this entry, e.g. `'^1.0.0'`. Used to detect version skew.
