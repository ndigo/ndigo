export {
    MappedServiceInterceptor,
    ServiceExecutionChain,
    likeCompletionAwareServiceInterceptor,
    likeErrorAwareServiceInterceptor,
    likeInitializationAwareServiceInterceptor,
    likeRequestAwareServiceInterceptor,
    likeResponseAwareServiceInterceptor,
    likeServiceInterceptor,
} from './service';

export type {
    ServiceInit,
    ServiceInterceptor,
    CompletionAwareServiceInterceptor,
    ErrorAwareServiceInterceptor,
    InitializationAwareServiceInterceptor,
    RequestAwareServiceInterceptor,
    ResponseAwareServiceInterceptor,
} from './service';

export * from './service-registry';
export * from './telemetry-hooks';
export * from './request-id-correlation';

// Declarative service clients (AD-8)
export { service, getCall, postCall, putCall, deleteCall, patchCall, queryCall } from './service-decorators';
export {
    getServiceConfig,
    getServiceCalls,
    SERVICE_METADATA_KEY,
    SERVICE_CALL_METADATA_KEY,
} from './service-decorators';
export type { ServiceClientConfig, ServiceCallConfig } from './service-decorators';
export { serviceClient, fillPathTemplate, resolveCallBody, SERVICE_NAME_HEADER } from './service-client';
export { parseServerSentEvents, ServerSentEventParser } from './server-sent-events';
export type { ServerSentEvent } from './server-sent-events';
