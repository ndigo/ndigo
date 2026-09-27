[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / profile

# Function: profile()

> **profile**(...`expressions`): \<`M`\>(`target`, `context`) => `M`

Marks a class or method as active only for the named profile(s).

## Parameters

### expressions

...`string`[]

Profile name(s) for which the decorated target stays
  active (`@profile('prod')` or `@profile('a', 'b')` for either-of).

## Returns

A decorator that stores profile metadata.

\<`M`\>(`target`, `context`) => `M`
