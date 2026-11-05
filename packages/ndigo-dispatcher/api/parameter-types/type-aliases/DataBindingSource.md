[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameter-types](../README.md) / DataBindingSource

# Type Alias: DataBindingSource

> **DataBindingSource** = `"query"` \| `"body"` \| `"cookie"` \| `"session-storage"` \| `"local-storage"`

The data sources whole-source binding (`dataBinderValue`) can read from,
per platform (D-3):

- browser: `query`, `cookie`, `session-storage`, `local-storage`
- node: `body`, `cookie`

The source is encoded in the resulting type (`data-{source}:value`), and
`SOURCES_BY_KIND` validates source-vs-mapping-kind compatibility at
registration time.
