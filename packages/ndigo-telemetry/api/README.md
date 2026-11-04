**@ndigo/telemetry v0.0.1**

***

# @ndigo/telemetry v0.0.1

API-only: metrics, tracing decorators, platform-free instrumentation bases,
and the re-exported logging surface from `@ndigo/log`.

## Since

1.0.0

## Author

Jeff Rose

## Classes

- [AbstractBaseInstrumentation](classes/AbstractBaseInstrumentation.md)
- [ContextAwareLogger](classes/ContextAwareLogger.md)
- [ContextInstrumentation](classes/ContextInstrumentation.md)
- [CounterRateResolver](classes/CounterRateResolver.md)
- [DispatcherInstrumentation](classes/DispatcherInstrumentation.md)
- [FeatureMetricAggregator](classes/FeatureMetricAggregator.md)
- [FeatureMetricAggregatorProvider](classes/FeatureMetricAggregatorProvider.md)
- [LoggerFactory](classes/LoggerFactory.md)

## Interfaces

- [CountConfig](interfaces/CountConfig.md)
- [CountedMethodConfig](interfaces/CountedMethodConfig.md)
- [CountedOptions](interfaces/CountedOptions.md)
- [CounterRateAlert](interfaces/CounterRateAlert.md)
- [CounterRateResolverOptions](interfaces/CounterRateResolverOptions.md)
- [CounterRateSnapshot](interfaces/CounterRateSnapshot.md)
- [DurationSummary](interfaces/DurationSummary.md)
- [FeatureMetricAggregatorOptions](interfaces/FeatureMetricAggregatorOptions.md)
- [FeatureMetrics](interfaces/FeatureMetrics.md)
- [LazyHistogramOptions](interfaces/LazyHistogramOptions.md)
- [LogEntry](interfaces/LogEntry.md)
- [Logger](interfaces/Logger.md)
- [MetricHistogramBucket](interfaces/MetricHistogramBucket.md)
- [MetricJSONEntry](interfaces/MetricJSONEntry.md)
- [MetricJSONPoint](interfaces/MetricJSONPoint.md)
- [MetricJSONView](interfaces/MetricJSONView.md)
- [MetricPoint](interfaces/MetricPoint.md)
- [MetricSnapshot](interfaces/MetricSnapshot.md)
- [MetricSnapshotProvider](interfaces/MetricSnapshotProvider.md)
- [SeverityMapping](interfaces/SeverityMapping.md)
- [SpanConfig](interfaces/SpanConfig.md)
- [TraceCorrelation](interfaces/TraceCorrelation.md)

## Type Aliases

- [LazyCounter](type-aliases/LazyCounter.md)
- [LazyHistogram](type-aliases/LazyHistogram.md)
- [LogAttributes](type-aliases/LogAttributes.md)
- [LoggerType](type-aliases/LoggerType.md)
- [MetricPointValue](type-aliases/MetricPointValue.md)
- [SeverityScheme](type-aliases/SeverityScheme.md)

## Variables

- [LOGGER\_LEVEL\_NAMES](variables/LOGGER_LEVEL_NAMES.md)
- [loggerSeverityMethodNames](variables/loggerSeverityMethodNames.md)

## Functions

- [counted](functions/counted.md)
- [createLazyCounter](functions/createLazyCounter.md)
- [createLazyHistogram](functions/createLazyHistogram.md)
- [currentTraceContext](functions/currentTraceContext.md)
- [detectSeverityScheme](functions/detectSeverityScheme.md)
- [getCounted](functions/getCounted.md)
- [getLogger](functions/getLogger.md)
- [getMetricSnapshotProvider](functions/getMetricSnapshotProvider.md)
- [getSeverityMapping](functions/getSeverityMapping.md)
- [getTraced](functions/getTraced.md)
- [hasCounted](functions/hasCounted.md)
- [hasTraced](functions/hasTraced.md)
- [levelToSeverityNumber](functions/levelToSeverityNumber.md)
- [levelToSeverityText](functions/levelToSeverityText.md)
- [loggerLevelName](functions/loggerLevelName.md)
- [registerMetricSnapshotProvider](functions/registerMetricSnapshotProvider.md)
- [renderMetricJson](functions/renderMetricJson.md)
- [renderPrometheusAttributes](functions/renderPrometheusAttributes.md)
- [renderPrometheusText](functions/renderPrometheusText.md)
- [resolveLoggerLevel](functions/resolveLoggerLevel.md)
- [sanitizePrometheusName](functions/sanitizePrometheusName.md)
- [setFallbackMetricSnapshotProvider](functions/setFallbackMetricSnapshotProvider.md)
- [severityNumberToLevel](functions/severityNumberToLevel.md)
- [traced](functions/traced.md)
- [unregisterMetricSnapshotProvider](functions/unregisterMetricSnapshotProvider.md)
