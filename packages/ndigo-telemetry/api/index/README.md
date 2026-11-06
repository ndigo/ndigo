[**@ndigo/telemetry v0.0.1**](../README.md)

***

[@ndigo/telemetry](../README.md) / index

# index

API-only: metrics, tracing decorators, platform-free instrumentation bases,

## Classes

- [ContextAwareLogger](classes/ContextAwareLogger.md)
- [LoggerFactory](classes/LoggerFactory.md)

## Interfaces

- [LogEntry](interfaces/LogEntry.md)
- [Logger](interfaces/Logger.md)
- [SeverityMapping](interfaces/SeverityMapping.md)

## Type Aliases

- [LogAttributes](type-aliases/LogAttributes.md)
- [LoggerType](type-aliases/LoggerType.md)
- [SeverityScheme](type-aliases/SeverityScheme.md)

## Variables

- [LOGGER\_LEVEL\_NAMES](variables/LOGGER_LEVEL_NAMES.md)
- [loggerSeverityMethodNames](variables/loggerSeverityMethodNames.md)

## Functions

- [detectSeverityScheme](functions/detectSeverityScheme.md)
- [getLogger](functions/getLogger.md)
- [getSeverityMapping](functions/getSeverityMapping.md)
- [levelToSeverityNumber](functions/levelToSeverityNumber.md)
- [levelToSeverityText](functions/levelToSeverityText.md)
- [loggerLevelName](functions/loggerLevelName.md)
- [resolveLoggerLevel](functions/resolveLoggerLevel.md)
- [severityNumberToLevel](functions/severityNumberToLevel.md)

## References

### AbstractBaseInstrumentation

Re-exports [AbstractBaseInstrumentation](../instrumentation/base/classes/AbstractBaseInstrumentation.md)

***

### ContextInstrumentation

Re-exports [ContextInstrumentation](../instrumentation/context/context/classes/ContextInstrumentation.md)

***

### CountConfig

Re-exports [CountConfig](../instrumentation/base/interfaces/CountConfig.md)

***

### counted

Re-exports [counted](../metrics/decorators/functions/counted.md)

***

### CountedMethodConfig

Re-exports [CountedMethodConfig](../metrics/decorators/interfaces/CountedMethodConfig.md)

***

### CountedOptions

Re-exports [CountedOptions](../metrics/decorators/interfaces/CountedOptions.md)

***

### CounterRateAlert

Re-exports [CounterRateAlert](../metrics/counter-rate-resolver/interfaces/CounterRateAlert.md)

***

### CounterRateResolver

Re-exports [CounterRateResolver](../metrics/counter-rate-resolver/classes/CounterRateResolver.md)

***

### CounterRateResolverOptions

Re-exports [CounterRateResolverOptions](../metrics/counter-rate-resolver/interfaces/CounterRateResolverOptions.md)

***

### CounterRateSnapshot

Re-exports [CounterRateSnapshot](../metrics/counter-rate-resolver/interfaces/CounterRateSnapshot.md)

***

### createLazyCounter

Re-exports [createLazyCounter](../metrics/lazy-counter/functions/createLazyCounter.md)

***

### createLazyHistogram

Re-exports [createLazyHistogram](../metrics/lazy-counter/functions/createLazyHistogram.md)

***

### currentTraceContext

Re-exports [currentTraceContext](../trace/correlation/functions/currentTraceContext.md)

***

### DispatcherInstrumentation

Re-exports [DispatcherInstrumentation](../instrumentation/dispatcher/dispatcher/classes/DispatcherInstrumentation.md)

***

### DurationSummary

Re-exports [DurationSummary](../metrics/feature-metric-aggregator/interfaces/DurationSummary.md)

***

### FeatureMetricAggregator

Re-exports [FeatureMetricAggregator](../metrics/feature-metric-aggregator/classes/FeatureMetricAggregator.md)

***

### FeatureMetricAggregatorOptions

Re-exports [FeatureMetricAggregatorOptions](../metrics/feature-metric-aggregator/interfaces/FeatureMetricAggregatorOptions.md)

***

### FeatureMetricAggregatorProvider

Re-exports [FeatureMetricAggregatorProvider](../metrics/feature-metric-aggregator/classes/FeatureMetricAggregatorProvider.md)

***

### FeatureMetrics

Re-exports [FeatureMetrics](../metrics/feature-metric-aggregator/interfaces/FeatureMetrics.md)

***

### getCounted

Re-exports [getCounted](../metrics/decorators/functions/getCounted.md)

***

### getMetricSnapshotProvider

Re-exports [getMetricSnapshotProvider](../metrics/metric-snapshot/functions/getMetricSnapshotProvider.md)

***

### getTraced

Re-exports [getTraced](../trace/decorators/functions/getTraced.md)

***

### hasCounted

Re-exports [hasCounted](../metrics/decorators/functions/hasCounted.md)

***

### hasTraced

Re-exports [hasTraced](../trace/decorators/functions/hasTraced.md)

***

### LazyCounter

Re-exports [LazyCounter](../metrics/lazy-counter/type-aliases/LazyCounter.md)

***

### LazyHistogram

Re-exports [LazyHistogram](../metrics/lazy-counter/type-aliases/LazyHistogram.md)

***

### LazyHistogramOptions

Re-exports [LazyHistogramOptions](../metrics/lazy-counter/interfaces/LazyHistogramOptions.md)

***

### MetricHistogramBucket

Re-exports [MetricHistogramBucket](../metrics/metric-snapshot/interfaces/MetricHistogramBucket.md)

***

### MetricJSONEntry

Re-exports [MetricJSONEntry](../metrics/metric-json/interfaces/MetricJSONEntry.md)

***

### MetricJSONPoint

Re-exports [MetricJSONPoint](../metrics/metric-json/interfaces/MetricJSONPoint.md)

***

### MetricJSONView

Re-exports [MetricJSONView](../metrics/metric-json/interfaces/MetricJSONView.md)

***

### MetricPoint

Re-exports [MetricPoint](../metrics/metric-snapshot/interfaces/MetricPoint.md)

***

### MetricPointValue

Re-exports [MetricPointValue](../metrics/metric-snapshot/type-aliases/MetricPointValue.md)

***

### MetricSnapshot

Re-exports [MetricSnapshot](../metrics/metric-snapshot/interfaces/MetricSnapshot.md)

***

### MetricSnapshotProvider

Re-exports [MetricSnapshotProvider](../metrics/metric-snapshot/interfaces/MetricSnapshotProvider.md)

***

### registerMetricSnapshotProvider

Re-exports [registerMetricSnapshotProvider](../metrics/metric-snapshot/functions/registerMetricSnapshotProvider.md)

***

### renderMetricJson

Re-exports [renderMetricJson](../metrics/metric-json/functions/renderMetricJson.md)

***

### renderPrometheusAttributes

Re-exports [renderPrometheusAttributes](../metrics/prometheus-text/functions/renderPrometheusAttributes.md)

***

### renderPrometheusText

Re-exports [renderPrometheusText](../metrics/prometheus-text/functions/renderPrometheusText.md)

***

### sanitizePrometheusName

Re-exports [sanitizePrometheusName](../metrics/prometheus-text/functions/sanitizePrometheusName.md)

***

### setFallbackMetricSnapshotProvider

Re-exports [setFallbackMetricSnapshotProvider](../metrics/metric-snapshot/functions/setFallbackMetricSnapshotProvider.md)

***

### SpanConfig

Re-exports [SpanConfig](../instrumentation/base/interfaces/SpanConfig.md)

***

### TraceCorrelation

Re-exports [TraceCorrelation](../trace/correlation/interfaces/TraceCorrelation.md)

***

### traced

Re-exports [traced](../trace/decorators/functions/traced.md)

***

### unregisterMetricSnapshotProvider

Re-exports [unregisterMetricSnapshotProvider](../metrics/metric-snapshot/functions/unregisterMetricSnapshotProvider.md)
