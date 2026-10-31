[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / FileSystemResourceLoader

# Class: FileSystemResourceLoader

`ResourceLoader` implementation that reads files from the local filesystem using
`node:fs/promises`. The `location` parameter is treated as a file path.

Returns an `UnresolvedResource` (with `exists === false`) if the file cannot be read.

When constructed with a `root`, every lookup is contained inside that
canonical directory: `location` is resolved against it and both the
lexical and real (symlink-resolved) paths MUST stay under `root + sep`, so
a traversal (`../`) or absolute location resolves to an unresolved resource
instead of reading outside the root. Without a `root` the loader stays
generic and reads the given path as-is.

## Implements

- [`ResourceLoader`](#)

## Constructors

### Constructor

> **new FileSystemResourceLoader**(`root?`): `FileSystemResourceLoader`

#### Parameters

##### root?

`string` \| `null` = `null`

Optional directory that confines every lookup. Pass
  `null` (the default) to load arbitrary paths.

#### Returns

`FileSystemResourceLoader`

## Methods

### getResource()

> **getResource**(`location`): `Promise`\<`Resource`\<`unknown`\>\>

Loads a file resource from the given path.

#### Parameters

##### location

`string`

Absolute or relative file path.

#### Returns

`Promise`\<`Resource`\<`unknown`\>\>

A resolved `Resource` containing the file contents as a string,
         or an `UnresolvedResource` if the read fails or escapes `root`.

#### Implementation of

`ResourceLoader.getResource`
