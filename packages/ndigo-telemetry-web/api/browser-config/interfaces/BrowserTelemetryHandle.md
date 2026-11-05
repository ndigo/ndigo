[**@ndigo/telemetry-web v0.0.1**](../../README.md)

***

[@ndigo/telemetry-web](../../README.md) / [browser-config](../README.md) / BrowserTelemetryHandle

# Interface: BrowserTelemetryHandle

Handle returned by [configureBrowserTelemetry](../functions/configureBrowserTelemetry.md) — explicit lifecycle
for hosts that own the page (SPAs, tests).

## Methods

### forceFlush()

> **forceFlush**(): `Promise`\<`void`\>

Flush pending spans/metrics/logs without shutting the providers down.

#### Returns

`Promise`\<`void`\>

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Remove the unload listeners and shut the providers down.

#### Returns

`Promise`\<`void`\>
