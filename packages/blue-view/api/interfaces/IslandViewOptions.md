[**@blue/view v0.0.1**](../README.md)

***

[@blue/view](../README.md) / IslandViewOptions

# Interface: IslandViewOptions

Construction options for [IslandView](../classes/IslandView.md).

## Properties

### shadowHtml?

> `optional` **shadowHtml?**: `string`

Trusted, author/design-system-supplied markup rendered inside a
Declarative Shadow DOM `<template shadowrootmode="open">` wrapper
(Baseline since 2024).

**Trusted markup only — never user input.** The value is interpolated
raw into the generated markup (exactly like an inline template), so an
untrusted value would be a direct XSS vector. Its purpose is
content-first paint — the first byte of HTML shows real content instead
of an empty element — and third-party components that cannot
server-render. Browsers parse the template into a real shadow root
before any script runs; `hydrateIslands()` then upgrades the element in
place and the component's first render replaces this fallback.
