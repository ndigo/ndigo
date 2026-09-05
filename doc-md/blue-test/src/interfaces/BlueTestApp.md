[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-test/src](../README.md) / BlueTestApp

# Interface: BlueTestApp

Defined in: [packages/blue-test/src/blue-test.ts:22](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-test/src/blue-test.ts#lines-22)

A booted application ready for MockMVC dispatch.

## Properties

### context

> **context**: `ApplicationContext`

Defined in: [packages/blue-test/src/blue-test.ts:24](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-test/src/blue-test.ts#lines-24)

The application context (real DI graph + auto-configs).

***

### dispatcher

> **dispatcher**: [`NodeDispatcher`](#)

Defined in: [packages/blue-test/src/blue-test.ts:26](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-test/src/blue-test.ts#lines-26)

The configured node dispatcher.

## Methods

### close()

> **close**(): `void`

Defined in: [packages/blue-test/src/blue-test.ts:28](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-test/src/blue-test.ts#lines-28)

Close the context and release resources.

#### Returns

`void`
