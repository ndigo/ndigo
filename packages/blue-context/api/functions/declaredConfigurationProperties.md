[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / declaredConfigurationProperties

# Function: declaredConfigurationProperties()

> **declaredConfigurationProperties**(`ctor`): [`DeclaredConfigurationProperty`](../interfaces/DeclaredConfigurationProperty.md)[]

Enumerate the configuration keys a `@configurationProperties` class declares,
without resolving any value.

Field mode walks `@property` fields (plus `@nested` sub-objects); schema
mode walks the `schema` shape keys and maps each zod type to its declared
conversion target. Keys are the same full keypaths binding uses
(`prefix.field`), deduplicated and sorted. This is the introspection seam
for tooling that must list declared configuration without touching the
environment — and so without ever exposing a value.

When a field-mode class's constructor throws, enumeration falls back to
metadata: top-level keys are still listed, but `@nested` subtrees are
limited to their top-level key (see `collectDeclaredPropertiesFromMetadata`).

## Parameters

### ctor

new () => `unknown`

The configuration properties class constructor.

## Returns

[`DeclaredConfigurationProperty`](../interfaces/DeclaredConfigurationProperty.md)[]

The declared keys, sorted by key, with the declared type when known.
