[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / FileSystemResourceLoader

# Class: FileSystemResourceLoader

Defined in: [packages/blue-platform-node/src/file-system-resource-loader.ts:29](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/file-system-resource-loader.ts#lines-29)

`ResourceLoader` implementation that reads files from the local filesystem using
`node:fs/promises`. The `location` parameter is treated as a file path.

Returns an `UnresolvedResource` (with `exists === false`) if the file cannot be read.

## Implements

- `ResourceLoader`

## Constructors

### Constructor

> **new FileSystemResourceLoader**(): `FileSystemResourceLoader`

#### Returns

`FileSystemResourceLoader`

## Methods

### getResource()

> **getResource**(`location`): `Promise`\<`Resource`\<`any`\>\>

Defined in: [packages/blue-platform-node/src/file-system-resource-loader.ts:37](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/file-system-resource-loader.ts#lines-37)

Loads a file resource from the given path.

#### Parameters

##### location

`string`

Absolute or relative file path.

#### Returns

`Promise`\<`Resource`\<`any`\>\>

A resolved `Resource` containing the file contents as a string,
         or an `UnresolvedResource` if the read fails.

#### Implementation of

`ResourceLoader.getResource`
