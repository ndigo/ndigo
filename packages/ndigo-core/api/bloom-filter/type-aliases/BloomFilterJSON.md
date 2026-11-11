[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [bloom-filter](../README.md) / BloomFilterJSON

# Type Alias: BloomFilterJSON

> **BloomFilterJSON** = `object`

The JSON form of a [BloomFilter](../classes/BloomFilter.md): the bit width, hash count, packed
buckets, and insertion count.

## Properties

### bits

> **bits**: `number`

Number of bits in the filter.

***

### buckets

> **buckets**: `number`[]

The packed bitset, one 32-bit word per entry.

***

### count

> **count**: `number`

Number of values added.

***

### hashes

> **hashes**: `number`

Number of hash functions per value.
