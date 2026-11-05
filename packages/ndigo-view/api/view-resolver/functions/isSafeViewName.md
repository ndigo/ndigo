[**@ndigo/view v0.0.1**](../../README.md)

***

[@ndigo/view](../../README.md) / [view-resolver](../README.md) / isSafeViewName

# Function: isSafeViewName()

> **isSafeViewName**(`name`): `boolean`

Returns whether a view name is safe to interpolate into a resolver path.

View names can reach resolvers from request-derived data (default route
names, path extensions), so a name must never escape the resolver's
`prefix` once joined with it. Rejected forms:

- NUL bytes, which truncate paths in native syscalls;
- absolute paths (`/x`, `\x`, `C:\x`), which discard the prefix;
- any drive specifier (`C:`, `c:`), including drive-relative forms like
  `C:foo` that lack a separator after the colon;
- any path segment that is `..`, including its matrix-param and
  trailing-space spellings (`..;x=1`, `.. `), which climb out of the
  prefix.

Separators are otherwise allowed so nested names (`admin/user`) keep
resolving, and dots inside a segment (`v1.2`, `my.file`) stay valid.

This is the single source of truth for the predicate: the resolver class
delegates to it, and the `no-unsafe-view-name-literal` lint rule asserts the
same vector table so the runtime and lint grammars cannot drift.

## Parameters

### name

`string`

The view name to validate.

## Returns

`boolean`

`true` when the name is safe to use as a relative path.
