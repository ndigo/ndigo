[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / whenProfile

# Function: whenProfile()

> **whenProfile**(`expression`): (`target`, `context`) => `void`

Class decorator that marks a configuration class as active only when a
profile expression matches the environment's effective active set (AD-14).

## Parameters

### expression

`string`

The profile expression (`dev`, `!prod`, `a & b`, `(a | b) & c`).

## Returns

A class decorator.

(`target`, `context`) => `void`

## Example

```ts
@whenProfile('!prod & (dev | test)')
class DevOnlyConfiguration { ... }
```
