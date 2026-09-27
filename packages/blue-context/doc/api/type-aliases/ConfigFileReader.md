[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / ConfigFileReader

# Type Alias: ConfigFileReader

> **ConfigFileReader** = (`path`) => `Promise`\<`string` \| `null`\>

Reads a file's text content, or `null` when the file does not exist.

The config-file seam (AD-13 Q1) keeps `@blue/boot` isomorphic:
`@blue/platform-node` supplies an `fs`-backed implementation; browsers and
specs pass none (files skipped / fake reader). Return `null` for missing
files — do not throw. Lives here (the shared core) so both `@blue/boot` and
`@blue/platform-node` reference the same seam type.

## Parameters

### path

`string`

## Returns

`Promise`\<`string` \| `null`\>
