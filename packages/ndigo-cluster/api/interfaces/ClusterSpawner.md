[**@ndigo/cluster v0.0.1**](../README.md)

***

[@ndigo/cluster](../README.md) / ClusterSpawner

# Interface: ClusterSpawner()

The spawn seam: a function producing a [ClusterChild](ClusterChild.md) from a
command and environment. Injectable so restart/signal logic is
unit-testable without real processes.

> **ClusterSpawner**(`options`): [`ClusterChild`](ClusterChild.md)

The spawn seam: a function producing a [ClusterChild](ClusterChild.md) from a
command and environment. Injectable so restart/signal logic is
unit-testable without real processes.

## Parameters

### options

#### command

`string`[]

#### cwd?

`string`

#### env

`Record`\<`string`, `string`\>

## Returns

[`ClusterChild`](ClusterChild.md)
