[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / ConsoleExporterOptions

# Interface: ConsoleExporterOptions

Defined in: packages/blue-logger/src/otel/exporters/console-exporter.ts:15

Console exporter options

## Properties

### layout?

> `optional` **layout**: [`Layout`](Layout.md)

Defined in: packages/blue-logger/src/otel/exporters/console-exporter.ts:20

Layout to use for formatting log records
Default: PatternLayout with '[%d] %c %p - %m'

---

### useColors?

> `optional` **useColors**: `boolean`

Defined in: packages/blue-logger/src/otel/exporters/console-exporter.ts:26

Whether to use colored output (if supported by console)
Default: true

---

### console?

> `optional` **console**: `Console`

Defined in: packages/blue-logger/src/otel/exporters/console-exporter.ts:32

Custom console object (for testing)
Default: global console
