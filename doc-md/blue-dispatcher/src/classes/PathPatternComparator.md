[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / PathPatternComparator

# Class: PathPatternComparator

Defined in: packages/blue-dispatcher/src/path-pattern-comparator.ts:39

Compares two path patterns by specificity so that more specific patterns
sort before less specific ones. This ensures deterministic route matching
when multiple patterns can match a given request path.

## Specificity Rules (most specific first)
1. Exact matches (no wildcards) beat pattern matches.
2. Longer patterns beat shorter patterns.
3. Fewer wildcard segments beat more wildcard segments.

## Implements

- `Comparator`\<`string`\>

## Constructors

### Constructor

> **new PathPatternComparator**(): `PathPatternComparator`

Defined in: packages/blue-dispatcher/src/path-pattern-comparator.ts:47

Creates a comparator for path pattern specificity.

#### Returns

`PathPatternComparator`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/path-pattern-comparator.ts:40

##### Returns

`string`

## Methods

### compare()

> **compare**(`pattern1`, `pattern2`): `number`

Defined in: packages/blue-dispatcher/src/path-pattern-comparator.ts:60

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
