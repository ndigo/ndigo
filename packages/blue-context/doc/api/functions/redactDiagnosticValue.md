[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / redactDiagnosticValue

# Function: redactDiagnosticValue()

> **redactDiagnosticValue**(`value`, `secretContext`): `string`

Formats a resolved property value for a diagnostic (error) message.

When a secret decryptor is configured, ANY value could be decrypted
plaintext, so the whole value is replaced by [REDACTED\_VALUE](../variables/REDACTED_VALUE.md); the
surrounding message still names the key path, which is the useful part.
Without a decryptor the value is JSON-serialized unchanged.

## Parameters

### value

`unknown`

The resolved value to render.

### secretContext

`boolean`

`true` when a decryptor is configured for the source.

## Returns

`string`

The diagnostic string.
