[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-management/src](../README.md) / METRIC\_AGGREGATOR

# Variable: METRIC\_AGGREGATOR

> `const` **METRIC\_AGGREGATOR**: [`ContextToken`](../../../blue-context/src/classes/ContextToken.md)\<`FeatureMetricAggregator`\>

Defined in: packages/blue-management/src/metric-aggregator-token.ts:13

Context token for the shared FeatureMetricAggregator entry that
management endpoints read. Apps wire one (e.g. via
`ManagementAutoConfiguration`) so `/metrics` reflects live counters.
