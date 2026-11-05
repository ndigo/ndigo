[**@ndigo/platform-web v0.0.1**](../../README.md)

***

[@ndigo/platform-web](../../README.md) / [browser-storage-argument-resolver](../README.md) / dumpStorage

# Function: dumpStorage()

> **dumpStorage**(`storage`): `Record`\<`string`, `unknown`\>

Dumps every key/value pair of a browser storage object into a plain record.

Shared by the storage value resolvers and the whole-source data-binding
resolver so the jar-dump loop lives in exactly one place (DSG-3).

## Parameters

### storage

`Storage` \| `null` \| `undefined`

The browser storage (`sessionStorage`/`localStorage`), or
  `null`/`undefined` when unavailable (e.g. prerendering, tests without a
  browser environment). Absent storage yields an empty record.

## Returns

`Record`\<`string`, `unknown`\>

The storage contents keyed by storage key.
