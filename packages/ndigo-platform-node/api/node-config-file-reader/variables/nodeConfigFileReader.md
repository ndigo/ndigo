[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [node-config-file-reader](../README.md) / nodeConfigFileReader

# Variable: nodeConfigFileReader

> `const` **nodeConfigFileReader**: `ConfigFileReader`

The Node default for the `ConfigFileReader` seam: reads UTF-8 and maps a
missing file to `null` (which `StandardConfigFileLoader` treats as "probe
the next location/format"). Any other error (EACCES, EISDIR, …) rethrows —
a real filesystem problem fails boot instead of silently skipping
configuration.

`runNodeApplication` wires it by default; callers assembling the loader
themselves pass it explicitly:
`new StandardConfigFileLoader({ reader: nodeConfigFileReader })`.

## Param

**path**

The config file path to read.

## Returns

The file contents, or `null` when the file does not exist.
