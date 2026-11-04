[**@ndigo/management v0.0.1**](../README.md)

***

[@ndigo/management](../README.md) / METRIC\_AGGREGATOR

# Variable: METRIC\_AGGREGATOR

> `const` **METRIC\_AGGREGATOR**: [`ContextToken`](#)\<[`FeatureMetricAggregator`](#)\>

Context token for the shared [FeatureMetricAggregator](#) entry that
management endpoints read. Apps wire one (e.g. via
`ManagementAutoConfiguration`) so `/metrics` reflects live counters.
