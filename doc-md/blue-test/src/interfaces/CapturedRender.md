[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-test/src](../README.md) / CapturedRender

# Interface: CapturedRender

Defined in: [packages/blue-test/src/memory-view-target.ts:19](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-test/src/memory-view-target.ts#lines-19)

A captured render: the output element, the model it was rendered with, and
the route that produced it.

## Properties

### output

> **output**: `unknown`

Defined in: [packages/blue-test/src/memory-view-target.ts:21](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-test/src/memory-view-target.ts#lines-21)

The rendered output (typically an `HTMLElement` created by the engine).

***

### model

> **model**: `unknown`

Defined in: [packages/blue-test/src/memory-view-target.ts:23](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-test/src/memory-view-target.ts#lines-23)

The model the view was rendered with.

***

### route

> **route**: [`Route`](#)

Defined in: [packages/blue-test/src/memory-view-target.ts:25](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-test/src/memory-view-target.ts#lines-25)

The route that triggered the render.
