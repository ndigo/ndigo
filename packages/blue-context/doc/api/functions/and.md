[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / and

# Function: and()

> **and**(...`terms`): [`ProfileTerm`](../classes/ProfileTerm.md)

Profiles that are all active (`a & b & …`). Compound children with a
looser precedence than `&` parenthesize: `and(or('a', 'b'), 'c')` →
`'(a | b) & c'`.

## Parameters

### terms

...[`ProfileExpressionInput`](../type-aliases/ProfileExpressionInput.md)[]

## Returns

[`ProfileTerm`](../classes/ProfileTerm.md)
