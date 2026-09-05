[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-router/src](../README.md) / FeatureActivationPolicy

# Type Alias: FeatureActivationPolicy

> **FeatureActivationPolicy** = `"tracked"` \| `"exclusive"`

Defined in: [packages/blue-router/src/feature-routing-registry.ts:17](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-router/src/feature-routing-registry.ts#lines-17)

Defines the policy for how features are activated within the `FeatureRoutingRegistry`.
- `'tracked'`: Allows multiple features to be active, tracking each one.
- `'exclusive'`: Only one feature can be active at a time; activating a new feature deactivates the previous one.

## Since

1.0.0
