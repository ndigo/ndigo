[**create-ndigo-app v0.0.1**](../../README.md)

***

[create-ndigo-app](../../README.md) / [types](../README.md) / ScaffoldOptions

# Interface: ScaffoldOptions

Parsed CLI flags.

## Properties

### agents

> **agents**: `boolean`

Write the AGENTS.md bootstrap pointer (default: on).

***

### description

> **description**: `string`

One-line description used in the manifest and README.

***

### force

> **force**: `boolean`

Force overwrite a non-empty target directory.

***

### kind

> **kind**: [`AppKind`](../type-aliases/AppKind.md)

Scaffold kind.

***

### local

> **local**: `boolean`

Rewrite `@ndigo/*` deps to `workspace:*` links against the workspace (dev mode).

***

### name

> **name**: `string`

App slug (kebab-case, without the `ndigo-` prefix).

***

### port

> **port**: `number`

Dev port (defaults to 3000).

***

### targetDir

> **targetDir**: `string`

Target directory (relative to the cwd unless absolute).

***

### ui

> **ui**: `boolean`

Write the ndigo-ui pointer and token import (browser kind only; default: off).

***

### yes

> **yes**: `boolean`

When true, accept all defaults without prompting.
