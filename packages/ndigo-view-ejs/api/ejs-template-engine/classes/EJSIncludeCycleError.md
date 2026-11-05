[**@ndigo/view-ejs v0.0.1**](../../README.md)

***

[@ndigo/view-ejs](../../README.md) / [ejs-template-engine](../README.md) / EJSIncludeCycleError

# Class: EJSIncludeCycleError

Raised when EJS `include(...)` recursion exceeds the depth bound, or revisits
a template already open in the current include chain (a cycle).

Bounded and named so a cyclic include fails deterministically — with a
message naming the offending specifier — instead of overflowing the call
stack (`RangeError: Maximum call stack size exceeded`) and leaking stray
unhandled rejections.

## Extends

- [`FrameworkError`](#)

## Constructors

### Constructor

> **new EJSIncludeCycleError**(`specifier`, `depth`): `EJSIncludeCycleError`

Creates the cycle/overflow error for the offending include specifier.

#### Parameters

##### specifier

`string`

The include path that closed or overflowed the chain.

##### depth

`number`

The include nesting depth reached.

#### Returns

`EJSIncludeCycleError`

#### Overrides

`FrameworkError.constructor`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

The string tag for this class.

##### Returns

`string`

#### Inherited from

`FrameworkError.[toStringTag]`

## Methods

### toJSON()?

> `optional` **toJSON**(): `JSONValue`

#### Returns

`JSONValue`

#### Inherited from

`FrameworkError.toJSON`

***

### toString()

> **toString**(): `string`

#### Returns

`string`

#### Inherited from

`FrameworkError.toString`
