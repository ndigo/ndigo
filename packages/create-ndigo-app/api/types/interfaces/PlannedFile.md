[**create-ndigo-app v0.0.1**](../../README.md)

***

[create-ndigo-app](../../README.md) / [types](../README.md) / PlannedFile

# Interface: PlannedFile

A single file-write plan entry.

The plan is resolved before anything is written, so a conditional file
(`--ui`'s pointer and stylesheet) sits beside the template tree instead of
becoming a second template source.

## Properties

### content

> **content**: `string`

Final file content, placeholders already substituted.

***

### destination

> **destination**: `string`

Destination path, relative to the target directory.

***

### template?

> `optional` **template?**: `string`

Source template path, relative to the templates root; absent for inline files.
