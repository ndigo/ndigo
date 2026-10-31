**@blue/log v0.0.1**

***

# @blue/log v0.0.1

Isomorphic logging core for BlueJS: logger abstraction, factory, and
severity mappings. Depends only on the OpenTelemetry API packages so that
low-level framework code can log without pulling in the telemetry stack.

## Since

1.0.0

## Author

Jeff Rose

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
