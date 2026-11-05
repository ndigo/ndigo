[**@ndigo/router v0.0.1**](../../README.md)

***

[@ndigo/router](../../README.md) / [feature-routing-registry](../README.md) / FeatureActivationPolicy

# Type Alias: FeatureActivationPolicy

> **FeatureActivationPolicy** = `"tracked"` \| `"exclusive"`

Defines the policy for how features are activated within the `FeatureRoutingRegistry`.
- `'tracked'`: Allows multiple features to be active, tracking each one.
- `'exclusive'`: Only one feature can be active at a time; activating a new feature deactivates the previous one.

## Since

1.0.0
