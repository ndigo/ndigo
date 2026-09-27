[**BlueJS Framework v0.0.1**](../README.md)

***

[BlueJS Framework](../modules.md) / blue-service

# blue-service

## Since

1.0.0

## Author

Jeff Rose

## Classes

- [CryptoRequestIdCorrelation](classes/CryptoRequestIdCorrelation.md)
- [ServerSentEventParser](classes/ServerSentEventParser.md)
- [MapServiceRegistry](classes/MapServiceRegistry.md)
- [MappedServiceInterceptor](classes/MappedServiceInterceptor.md)
- [ServiceExecutionChain](classes/ServiceExecutionChain.md)
- [EventEmitterTelemetryHooks](classes/EventEmitterTelemetryHooks.md)

## Interfaces

- [ServerSentEvent](interfaces/ServerSentEvent.md)
- [RequestIdCorrelation](interfaces/RequestIdCorrelation.md)
- [ServiceClientConfig](interfaces/ServiceClientConfig.md)
- [ServiceCallConfig](interfaces/ServiceCallConfig.md)
- [ServiceRegistry](interfaces/ServiceRegistry.md)
- [CompletionAwareServiceInterceptor](interfaces/CompletionAwareServiceInterceptor.md)
- [ErrorAwareServiceInterceptor](interfaces/ErrorAwareServiceInterceptor.md)
- [InitializationAwareServiceInterceptor](interfaces/InitializationAwareServiceInterceptor.md)
- [RequestAwareServiceInterceptor](interfaces/RequestAwareServiceInterceptor.md)
- [ResponseAwareServiceInterceptor](interfaces/ResponseAwareServiceInterceptor.md)
- [TelemetryHooks](interfaces/TelemetryHooks.md)

## Type Aliases

- [ServiceInit](type-aliases/ServiceInit.md)
- [ServiceInterceptor](type-aliases/ServiceInterceptor.md)

## Variables

- [SERVICE\_NAME\_HEADER](variables/SERVICE_NAME_HEADER.md)
- [SERVICE\_METADATA\_KEY](variables/SERVICE_METADATA_KEY.md)
- [SERVICE\_CALL\_METADATA\_KEY](variables/SERVICE_CALL_METADATA_KEY.md)
- [getCall](variables/getCall.md)
- [postCall](variables/postCall.md)
- [putCall](variables/putCall.md)
- [deleteCall](variables/deleteCall.md)
- [patchCall](variables/patchCall.md)
- [queryCall](variables/queryCall.md)
- [likeCompletionAwareServiceInterceptor](variables/likeCompletionAwareServiceInterceptor.md)
- [likeErrorAwareServiceInterceptor](variables/likeErrorAwareServiceInterceptor.md)
- [likeInitializationAwareServiceInterceptor](variables/likeInitializationAwareServiceInterceptor.md)
- [likeRequestAwareServiceInterceptor](variables/likeRequestAwareServiceInterceptor.md)
- [likeResponseAwareServiceInterceptor](variables/likeResponseAwareServiceInterceptor.md)

## Functions

- [parseServerSentEvents](functions/parseServerSentEvents.md)
- [fillPathTemplate](functions/fillPathTemplate.md)
- [resolveCallBody](functions/resolveCallBody.md)
- [serviceClient](functions/serviceClient.md)
- [getServiceConfig](functions/getServiceConfig.md)
- [getServiceCalls](functions/getServiceCalls.md)
- [service](functions/service.md)
- [likeServiceInterceptor](functions/likeServiceInterceptor.md)
