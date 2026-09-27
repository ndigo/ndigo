[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / PathPatternComparator

# Class: PathPatternComparator

Compares two path patterns by specificity so that more specific patterns
sort before less specific ones. This ensures deterministic route matching
when multiple patterns can match a given request path.

## Specificity Rules (most specific first)
1. Exact matches (no wildcards) beat pattern matches.
2. Fewer greedy segments (`**` / `{*name}`) beat more — a catch-all is
   strictly less specific than any non-greedy pattern.
3. Longer patterns beat shorter patterns.
4. Fewer wildcard segments beat more wildcard segments.

## Implements

- `Comparator`\<`string`\>

## Constructors

### Constructor

> **new PathPatternComparator**(): `PathPatternComparator`

Creates a comparator for path pattern specificity.

#### Returns

`PathPatternComparator`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

## Methods

### compare()

> **compare**(`pattern1`, `pattern2`): `number`

Compares two path patterns for specificity ordering.

#### Parameters

##### pattern1

`string`

The first path pattern.

##### pattern2

`string`

The second path pattern.

#### Returns

`number`

A negative number when `pattern1` is more specific than `pattern2`,
         a positive number when `pattern2` is more specific,
         or zero when they have equal specificity.

#### Implementation of

`Comparator.compare`
