[**@ndigo/host v0.0.1**](../../README.md)

***

[@ndigo/host](../../README.md) / [host-manager](../README.md) / HostManagerOptions

# Interface: HostManagerOptions

Options for the [HostManager](../classes/HostManager.md).

## Properties

### activationPolicy?

> `optional` **activationPolicy?**: `FeatureActivationPolicy`

Feature activation policy; defaults to `'tracked'`.

***

### metricRecorder?

> `optional` **metricRecorder?**: `FeatureMetricRecorder`

Records feature mount/activation metrics.

***

### onActivationError?

> `optional` **onActivationError?**: (`name`, `error`) => `void`

Optional callback invoked when a dynamically loaded feature's
activation fails — e.g. a rejected loader or dependency-validation
failure. Receives the feature name and the rejected error. Only fired
for the fire-and-forget lazy activation; the routing registry retains
its retry-on-next-activate semantics.

#### Parameters

##### name

`string`

##### error

`unknown`

#### Returns

`void`
