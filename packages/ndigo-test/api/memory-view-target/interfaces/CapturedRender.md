[**@ndigo/test v0.0.1**](../../README.md)

***

[@ndigo/test](../../README.md) / [memory-view-target](../README.md) / CapturedRender

# Interface: CapturedRender

A captured render: the output element, the model it was rendered with, and
the route that produced it.

## Properties

### model

> **model**: `unknown`

The model the view was rendered with.

***

### output

> **output**: `unknown`

The rendered output (typically an `HTMLElement` created by the engine).

***

### route

> **route**: [`Route`](#)

The route that triggered the render.
