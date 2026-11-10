[**@ndigo/view-webcomponent v0.0.1**](../../README.md)

***

[@ndigo/view-webcomponent](../../README.md) / [webmcp](../README.md) / WebMcpToolAnnotations

# Interface: WebMcpToolAnnotations

Safety hints understood by WebMCP hosts.

## Properties

### consequentialHint?

> `readonly` `optional` **consequentialHint?**: `boolean`

The action is significant or hard to reverse.

***

### debugging?

> `readonly` `optional` **debugging?**: `boolean`

The tool exists for developer tooling only.

***

### readOnlyHint?

> `readonly` `optional` **readOnlyHint?**: `boolean`

The tool only reads state.

***

### untrustedContentHint?

> `readonly` `optional` **untrustedContentHint?**: `boolean`

The output contains third-party/user content.
