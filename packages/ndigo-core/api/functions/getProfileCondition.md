[**@ndigo/core v0.0.1**](../README.md)

***

[@ndigo/core](../README.md) / getProfileCondition

# Function: getProfileCondition()

> **getProfileCondition**(`target`, `methodName?`): `string` \| `undefined`

Reads the canonical profile condition stored on a class or one of its
methods — the read counterpart of [whenProfile](whenProfile.md) (AD-83). The
configuration parser uses this to gate classes and entry methods; boot
uses [isActive](isActive.md) on classes only.

## Parameters

### target

`unknown`

The class constructor or instance to inspect.

### methodName?

`string`

When set, read the condition recorded for that method.

## Returns

`string` \| `undefined`

The canonical profile expression, or `undefined` when unset.
