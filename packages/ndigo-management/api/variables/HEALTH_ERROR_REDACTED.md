[**@ndigo/management v0.0.1**](../README.md)

***

[@ndigo/management](../README.md) / HEALTH\_ERROR\_REDACTED

# Variable: HEALTH\_ERROR\_REDACTED

> `const` **HEALTH\_ERROR\_REDACTED**: `"unavailable"` = `'unavailable'`

The marker `/health` reports when an indicator throws and error details
are redacted (SEC-5/AD-36): the status stays `DOWN` and the component name
is preserved, but the exception text never reaches the wire.
