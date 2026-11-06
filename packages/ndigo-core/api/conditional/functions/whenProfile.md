[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [conditional](../README.md) / whenProfile

# Function: whenProfile()

> **whenProfile**(...`expressions`): \<`M`\>(`target`, `context`) => `M`

Class or method decorator that marks the annotated target active only when
a profile expression matches the environment's effective active set
(AD-14; unified as the single profile gate by AD-83).

A single expression keeps its form; multiple arguments mean either-of and
fold into one canonical `a | b` expression at decoration time. Composed
[ProfileTerm](../../profile/classes/ProfileTerm.md) expressions (AD-34 D5) are accepted and normalized the
same way. On a class the condition gates registration; on an entry method
it gates that entry alone.

## Parameters

### expressions

...(`string` \| [`ProfileTerm`](../../profile/classes/ProfileTerm.md))[]

One profile expression, or multiple for either-of.

## Returns

A class/method decorator that stores the canonical condition.

\<`M`\>(`target`, `context`) => `M`

## Example

```ts
@whenProfile('!prod & (dev | test)')
class DevOnlyConfiguration {}

@whenProfile('dev', 'test') // either-of -> 'dev | test'
@entry()
class DevOrTestConfiguration {
  devOrTestEntry() {}
}
```
