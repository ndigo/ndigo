[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / createBatchConsoleProvider

# Function: createBatchConsoleProvider()

> **createBatchConsoleProvider**(`config`): [`BlueLoggerProvider`](../classes/BlueLoggerProvider.md)

Defined in: packages/blue-logger/src/otel/blue-logger-provider.ts:267

Create a BlueLoggerProvider with batching console exporter

## Parameters

### config

`Omit`\<[`BlueLoggerProviderConfig`](../interfaces/BlueLoggerProviderConfig.md), `"processors"`\> = `{}`

Optional configuration

## Returns

[`BlueLoggerProvider`](../classes/BlueLoggerProvider.md)

Configured BlueLoggerProvider with batching

## Example

```typescript
const provider = createBatchConsoleProvider();
const logger = provider.createLogger('my-app');
```
