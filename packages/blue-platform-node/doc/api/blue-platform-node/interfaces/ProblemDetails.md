[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / ProblemDetails

# Interface: ProblemDetails

A single RFC 9457 problem-details member set. `type` and `title` are
optional per the RFC (omitted `type` implies `about:blank`); `status` is
the HTTP status; `errors` is the Blue extension member for per-field
validation issues (Phase 4A).

## Properties

### detail?

> `optional` **detail?**: `string`

A human-readable explanation specific to this occurrence.

***

### errors?

> `optional` **errors?**: readonly `ValidationIssue`[]

Blue extension: structured per-field validation failures.

***

### instance?

> `optional` **instance?**: `string`

A URI reference identifying the specific occurrence (e.g. the request path).

***

### status

> **status**: `number`

The HTTP status code.

***

### title?

> `optional` **title?**: `string`

A human-readable title summarizing the problem.

***

### type?

> `optional` **type?**: `string`

For known framework errors, a `urn:blue:<slug>`. Omit for `about:blank`.
