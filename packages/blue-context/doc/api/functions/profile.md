[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / profile

# Function: profile()

> **profile**(...`expressions`): \<`M`\>(`target`, `context`) => `M`

Marks a class or method as active only for the named profile(s).

## Parameters

### expressions

...(`string` \| [`ProfileTerm`](../classes/ProfileTerm.md))[]

Profile name(s) for which the decorated target stays
  active (`@profile('prod')` or `@profile('a', 'b')` for either-of).
  Composed [ProfileTerm](../classes/ProfileTerm.md) expressions (AD-34 D5) are accepted and
  coerced to their canonical string.

## Returns

A decorator that stores profile metadata.

\<`M`\>(`target`, `context`) => `M`
