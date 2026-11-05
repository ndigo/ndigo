[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [formatter](../README.md) / createFormattingService

# Function: createFormattingService()

> **createFormattingService**(`options?`): [`FormattingService`](../interfaces/FormattingService.md)

Creates a [FormattingService](../interfaces/FormattingService.md) with shared locale/time-zone defaults.

## Parameters

### options?

[`FormattingServiceOptions`](../interfaces/FormattingServiceOptions.md) = `{}`

The service-wide defaults.

## Returns

[`FormattingService`](../interfaces/FormattingService.md)

A configured formatting service.

## Throws

When a formatter is created without a locale
from either the service defaults or the per-formatter options.

## Example

```ts
const format = createFormattingService({ locale: 'en-US', timeZone: 'UTC' });
format.date({ dateStyle: 'medium' }).format(new Date());       // 'Sep 13, 2026'
format.number({ style: 'percent' }).format(0.42);              // '42%'
```
