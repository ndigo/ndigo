[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [count-min-sketch](../README.md) / CountMinSketchJSON

# Type Alias: CountMinSketchJSON

> **CountMinSketchJSON** = `object`

The JSON form of a [CountMinSketch](../classes/CountMinSketch.md): its dimensions, counter table,
and total observed count.

## Properties

### depth

> **depth**: `number`

Number of hash rows.

***

### table

> **table**: `number`[][]

One row of counters per hash function.

***

### total

> **total**: `number`

Total count added across every value.

***

### width

> **width**: `number`

Number of counters per row.
