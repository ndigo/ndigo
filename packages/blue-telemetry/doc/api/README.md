**@blue/telemetry v0.0.1**

***

# @blue/telemetry v0.0.1

API-only: metrics, tracing decorators, platform-free instrumentation bases,
and the re-exported logging surface from `@blue/log`.

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
- [LogEntry](interfaces/LogEntry.md)
- [Logger](interfaces/Logger.md)
- [SeverityMapping](interfaces/SeverityMapping.md)
- [SpanConfig](interfaces/SpanConfig.md)
- [TraceCorrelation](interfaces/TraceCorrelation.md)

## Type Aliases

- [LazyCounter](type-aliases/LazyCounter.md)
- [LogAttributes](type-aliases/LogAttributes.md)
- [LoggerType](type-aliases/LoggerType.md)
- [SeverityScheme](type-aliases/SeverityScheme.md)

## Variables

- [loggerSeverityMethodNames](variables/loggerSeverityMethodNames.md)

## Functions

- [counted](functions/counted.md)
- [createLazyCounter](functions/createLazyCounter.md)
- [currentTraceContext](functions/currentTraceContext.md)
- [detectSeverityScheme](functions/detectSeverityScheme.md)
- [getCounted](functions/getCounted.md)
- [getLogger](functions/getLogger.md)
- [getSeverityMapping](functions/getSeverityMapping.md)
- [getTraced](functions/getTraced.md)
- [hasCounted](functions/hasCounted.md)
- [hasTraced](functions/hasTraced.md)
- [levelToSeverityNumber](functions/levelToSeverityNumber.md)
- [levelToSeverityText](functions/levelToSeverityText.md)
- [severityNumberToLevel](functions/severityNumberToLevel.md)
- [traced](functions/traced.md)
