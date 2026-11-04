[**@ndigo/boot v0.0.1**](../README.md)

***

[@ndigo/boot](../README.md) / DeclaredConfigurationProperty

# Interface: DeclaredConfigurationProperty

A configuration property declared by a `@configurationProperties` class.

Deliberately value-free: it describes what a class *declares*, never what
the environment currently holds.

## Properties

### key

> **key**: `string`

The full environment keypath (`prefix.field`, e.g. `server.port`).

***

### type?

> `optional` **type?**: `string`

The declared conversion target (`number`/`boolean`/`date`/`string`), when derivable.
