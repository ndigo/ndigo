[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [swagger-ui-controller](../README.md) / renderSwaggerUiPage

# Function: renderSwaggerUiPage()

> **renderSwaggerUiPage**(`title`): `string`

Renders the Swagger UI page for the given title.

No inline script (SEC-2): the default-on CSP (`script-src 'self'`, see
[SecurityHeadersInterceptor](../../security-headers-interceptor/classes/SecurityHeadersInterceptor.md)) blocks inline `<script>` blocks, so
the spec-wiring bootstrap is served as the `swagger-ui-init.js` asset
next to the `swagger-ui-dist` bundle — all same-origin, all CSP-clean.

## Parameters

### title

`string`

The documented API title.

## Returns

`string`

The HTML page.
