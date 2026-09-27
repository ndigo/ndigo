[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / FileSystemResourceLoader

# Class: FileSystemResourceLoader

`ResourceLoader` implementation that reads files from the local filesystem using
`node:fs/promises`. The `location` parameter is treated as a file path.

Returns an `UnresolvedResource` (with `exists === false`) if the file cannot be read.

## Implements

- [`ResourceLoader`](#)

## Constructors

### Constructor

> **new FileSystemResourceLoader**(): `FileSystemResourceLoader`

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
         or an `UnresolvedResource` if the read fails.

#### Implementation of

`ResourceLoader.getResource`
