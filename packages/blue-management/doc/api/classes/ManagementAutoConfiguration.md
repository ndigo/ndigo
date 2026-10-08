[**@blue/management v0.0.1**](../README.md)

***

[@blue/management](../README.md) / ManagementAutoConfiguration

# Class: ManagementAutoConfiguration

Auto-configuration for management endpoints (AD-76).

## Extends

- `ApplicationContextAware` & `Null`\<`this`\>

## Constructors

### Constructor

> **new ManagementAutoConfiguration**(`options?`): `ManagementAutoConfiguration`

#### Parameters

##### options?

[`ManagementAutoConfigurationOptions`](../interfaces/ManagementAutoConfigurationOptions.md) = `{}`

#### Returns

`ManagementAutoConfiguration`

#### Overrides

`AsApplicationContextAware(Null).constructor`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

`AsApplicationContextAware(Null).[$aware]`

***

### applicationContext

> `readonly` **applicationContext**: `ApplicationContext`

## Methods

### configurationPropertiesController()

> **configurationPropertiesController**(): [`ConfigurationPropertiesController`](ConfigurationPropertiesController.md)

The `/configprops` controller bean (AD-76 D-8).

#### Returns

[`ConfigurationPropertiesController`](ConfigurationPropertiesController.md)

The configuration-properties controller.

***

### environmentController()

> **environmentController**(): [`EnvironmentController`](EnvironmentController.md)

The `/env` controller bean (AD-76 D-8).

#### Returns

[`EnvironmentController`](EnvironmentController.md)

The environment controller.

***

### handlerMappings()

> **handlerMappings**(): `RadixMetadataHandlerMapping`[]

The metadata handler mapping(s): the default security-header set is
prepended (same instance shape as the platform mapping — the served
management routes otherwise bypass the interceptor attached to the
*platform* mapping), the management-path guard pushed onto the
interceptor chain when present, and the controllers detected through
it like every other decorator-driven handler (AD-76 D-8: detection
registers the *processed* bean, so the handlers run with their
context wired). Declared as the `handlerMappings` collection (the
resolution the strategy checks first), so it is immune to
registration-order clobbering by `NodeAutoConfiguration.handlerMapping`.

Exposure is enforced **per request** inside the controllers (AD-76
D-2): a disabled endpoint answers 404, and its path is covered by the
guard like every other management route — same wire behavior as not
registering it.

#### Returns

`RadixMetadataHandlerMapping`[]

The metadata mapping (security headers default-on, guard-attached when configured).

***

### healthController()

> **healthController**(): [`HealthController`](HealthController.md)

Serves `/health`.

#### Returns

[`HealthController`](HealthController.md)

The health controller.

***

### healthRegistry()

> **healthRegistry**(): [`HealthRegistry`](HealthRegistry.md)

The health registry, pre-wired with the telemetry indicator (which
reads the shared aggregator at check time). Registered once at context
refresh — never mutated per request.

#### Returns

[`HealthRegistry`](HealthRegistry.md)

The registry.

***

### loggersController()

> **loggersController**(): [`LoggersController`](LoggersController.md)

The `/loggers` controller bean (AD-76 D-8): decorator-registered, so
handler detection dispatches the context-processed instance.

#### Returns

[`LoggersController`](LoggersController.md)

The loggers controller.

***

### metricAggregator()

> **metricAggregator**(): [`FeatureMetricAggregator`](#)

The shared feature-metric aggregator backing `/metrics`.

#### Returns

[`FeatureMetricAggregator`](#)

The shared aggregator.

***

### metricsController()

> **metricsController**(): [`MetricsController`](MetricsController.md)

Serves `/metrics` (the guard from options applies at the dispatch
level, see [ManagementAutoConfiguration.handlerMappings](#handlermappings)).

#### Returns

[`MetricsController`](MetricsController.md)

The metrics controller.

***

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Set the ApplicationContext that this object runs in. Normally this call will be used to initialize the object.

Invoked after population of normal value properties but before an `init` callback.

#### Parameters

##### applicationContext

`ApplicationContext`

The ApplicationContext to be used by this object.

#### Returns

`void`

#### Inherited from

`AsApplicationContextAware(Null).setApplicationContext`
