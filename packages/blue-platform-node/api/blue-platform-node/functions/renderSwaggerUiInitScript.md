[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / renderSwaggerUiInitScript

# Function: renderSwaggerUiInitScript()

> **renderSwaggerUiInitScript**(`specUrl`): `string`

Renders the Swagger UI bootstrap as a served asset (SEC-2).

Loaded after the bundle + preset, so `SwaggerUIBundle` and
`SwaggerUIStandalonePreset` exist when it runs. It is server-rendered
because the spec URL is instance configuration, and externalized so the
default-on CSP never has to admit `'unsafe-inline'`.

## Parameters

### specUrl

`string`

The relative spec URL the UI fetches.

## Returns

`string`

The bootstrap JavaScript.
