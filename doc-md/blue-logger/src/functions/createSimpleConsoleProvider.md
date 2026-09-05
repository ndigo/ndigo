[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / createSimpleConsoleProvider

# Function: createSimpleConsoleProvider()

> **createSimpleConsoleProvider**(`config`): [`BlueLoggerProvider`](../classes/BlueLoggerProvider.md)

Defined in: packages/blue-logger/src/otel/blue-logger-provider.ts:236

Create a simple BlueLoggerProvider with console logging

## Parameters

### config

`Omit`\<[`BlueLoggerProviderConfig`](../interfaces/BlueLoggerProviderConfig.md), `"processors"`\> = `{}`

Optional configuration

## Returns

[`BlueLoggerProvider`](../classes/BlueLoggerProvider.md)

Configured BlueLoggerProvider

## Example

```typescript
const provider = createSimpleConsoleProvider();
const logger = provider.createLogger('my-app');
```
