[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [model-and-view](../README.md) / ModelAndViewOptions

# Interface: ModelAndViewOptions

Optional, additive settings for a [ModelAndView](../classes/ModelAndView.md).

## Properties

### viewTarget?

> `optional` **viewTarget?**: [`ViewTarget`](#)

Destination for this result, bypassing the dispatcher's targeter chain.

Supplying a target here is the decentralized placement path: the handler
(or the view it returns) decides where the output lands. It must be a
[ViewTarget](#) instance — never a selector — so request-derived
values cannot reach a DOM lookup.
