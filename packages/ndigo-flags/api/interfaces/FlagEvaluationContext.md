[**@ndigo/flags v0.0.1**](../README.md)

***

[@ndigo/flags](../README.md) / FlagEvaluationContext

# Interface: FlagEvaluationContext

The runtime context a flag evaluation may use for targeting.

Not every provider reads this; the property-backed provider is static
today. The seam exists so a targeting/traffic-split provider can
implement percentage rollouts per subject (AD-82 D-6).

## Properties

### attributes?

> `optional` **attributes?**: `Record`\<`string`, `unknown`\>

Arbitrary attributes the provider may use for targeting.

***

### targetingKey?

> `optional` **targetingKey?**: `string`

Stable identifier for the subject (user, session, tenant, device…).
