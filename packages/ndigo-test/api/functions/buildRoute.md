[**@ndigo/test v0.0.1**](../README.md)

***

[@ndigo/test](../README.md) / buildRoute

# Function: buildRoute()

> **buildRoute**(`request`, `responseSink`): [`PreparedRoute`](../interfaces/PreparedRoute.md)

Builds a [Route](#) with `NODE_REQUEST_ATTRIBUTE` / `NODE_RESPONSE_ATTRIBUTE`
attributes and the path/query/body/segments populated.

## Parameters

### request

[`MockRequest`](../interfaces/MockRequest.md)

The mock request spec.

### responseSink

[`ResponseSink`](../interfaces/ResponseSink.md)

The in-memory response sink to place at `NODE_RESPONSE_ATTRIBUTE`.

## Returns

[`PreparedRoute`](../interfaces/PreparedRoute.md)

The prepared route.
