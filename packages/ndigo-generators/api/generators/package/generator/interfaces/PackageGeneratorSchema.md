[**@ndigo/generators v0.0.1**](../../../../README.md)

***

[@ndigo/generators](../../../../README.md) / [generators/package/generator](../README.md) / PackageGeneratorSchema

# Interface: PackageGeneratorSchema

Options for the `package` generator: the package name and its one-line
description, plus `jobs` to wire the `@ndigo/jobs` dependency into the
generated manifest.

## Properties

### description?

> `optional` **description?**: `string`

***

### jobs?

> `optional` **jobs?**: `boolean`

Wire the `@ndigo/jobs` dependency (durable jobs / transactional
outbox, AD-72) into the generated package. Off by default — keep
skeletons dependency-free until a feature asks for one.

***

### name

> **name**: `string`

