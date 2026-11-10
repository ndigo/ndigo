[**@ndigo/mcp v0.0.1**](../../README.md)

***

[@ndigo/mcp](../../README.md) / [ui-resource](../README.md) / createUiResource

# Function: createUiResource()

> **createUiResource**(`input`): [`UiResource`](../interfaces/UiResource.md)

Builds one self-contained MCP App document.

## Parameters

### input

[`UiResourceInput`](../interfaces/UiResourceInput.md)

Markup, inlined assets, and presentation metadata.

## Returns

[`UiResource`](../interfaces/UiResource.md)

The resource served by `resources/read`.

## Throws

When the URI is not `ui://` or inlined CSS/JS would break out of its
  element.
