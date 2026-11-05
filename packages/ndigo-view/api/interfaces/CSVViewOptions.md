[**@ndigo/view v0.0.1**](../README.md)

***

[@ndigo/view](../README.md) / CSVViewOptions

# Interface: CSVViewOptions

Construction options for [CSVView](../classes/CSVView.md).

## Properties

### columns?

> `optional` **columns?**: `string`[]

Column order for the header and every row. When omitted, the columns
are derived from the first record's keys.

***

### delimiter?

> `optional` **delimiter?**: `string`

Field delimiter. Defaults to `,`.

***

### records?

> `optional` **records?**: `string`

Model attribute holding the record array. Views receive the whole
model map (attribute-style model), so when the records live under a
named attribute (e.g. `{ rows: [...] }`), name it here. When omitted,
the model itself must be the array.
