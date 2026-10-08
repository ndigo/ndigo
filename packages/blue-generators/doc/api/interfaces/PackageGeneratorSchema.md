[**@blue/generators v0.0.1**](../README.md)

***

[@blue/generators](../README.md) / PackageGeneratorSchema

# Interface: PackageGeneratorSchema

## Properties

### description?

> `optional` **description?**: `string`

***

### jobs?

> `optional` **jobs?**: `boolean`

Wire the `@blue/jobs` dependency (durable jobs / transactional
outbox, AD-72) into the generated package. Off by default — keep
skeletons dependency-free until a feature asks for one.

***

### name

> **name**: `string`
