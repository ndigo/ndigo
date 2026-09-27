[**@blue/test v0.0.1**](../README.md)

***

[@blue/test](../README.md) / BlueTestApp

# Interface: BlueTestApp

A booted application ready for MockHTTP dispatch.

## Properties

### context

> **context**: `ApplicationContext`

The application context (real DI graph + auto-configs).

***

### dispatcher

> **dispatcher**: [`NodeDispatcher`](#)

The configured node dispatcher.

## Methods

### close()

> **close**(): `void`

Close the context and release resources.

#### Returns

`void`
