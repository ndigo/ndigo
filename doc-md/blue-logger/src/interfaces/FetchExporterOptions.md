[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / FetchExporterOptions

# Interface: FetchExporterOptions

Defined in: packages/blue-logger/src/otel/exporters/fetch-exporter.ts:14

Fetch exporter options

## Extends

- `RequestInit`

## Properties

### timeout?

> `optional` **timeout**: `number`

Defined in: packages/blue-logger/src/otel/exporters/fetch-exporter.ts:20

Request timeout in milliseconds
Set to -1 for no timeout
Default: 30000 (30 seconds)

---

### layout?

> `optional` **layout**: [`BatchLayout`](BatchLayout.md)

Defined in: packages/blue-logger/src/otel/exporters/fetch-exporter.ts:26

Layout to use for formatting log batches
Default: JSONLayout

---

### headers?

> `optional` **headers**: `HeadersInit`

Defined in: packages/blue-logger/src/otel/exporters/fetch-exporter.ts:31

Additional headers to include in the request

#### Overrides

`RequestInit.headers`
