[**BlueJS Framework v0.0.1**](../README.md)

***

[BlueJS Framework](../modules.md) / blue-platform-node

# blue-platform-node

## Since

1.0.0

## Author

Jeff Rose

## Classes

- [NodeBodyValueMethodArgumentResolver](classes/NodeBodyValueMethodArgumentResolver.md)
- [NodeCookieValueMethodArgumentResolver](classes/NodeCookieValueMethodArgumentResolver.md)
- [CORSInterceptor](classes/CORSInterceptor.md)
- [CsrfInterceptor](classes/CsrfInterceptor.md)
- [FileSystemResourceLoader](classes/FileSystemResourceLoader.md)
- [FileSystemRouter](classes/FileSystemRouter.md)
- [NodeHeaderValueMethodArgumentResolver](classes/NodeHeaderValueMethodArgumentResolver.md)
- [RequestLimitError](classes/RequestLimitError.md)
- [HTTPServer](classes/HTTPServer.md)
- [NodeLastResortErrorResolver](classes/NodeLastResortErrorResolver.md)
- [NodeAutoConfiguration](classes/NodeAutoConfiguration.md)
- [NodeDispatcher](classes/NodeDispatcher.md)
- [NodeEnvironment](classes/NodeEnvironment.md)
- [NodeHTTPServerAdapter](classes/NodeHTTPServerAdapter.md)
- [NodeSocketSessionRegistry](classes/NodeSocketSessionRegistry.md)
- [HTTPResponseViewTarget](classes/HTTPResponseViewTarget.md)
- [NodeParameterBindingErrorResolver](classes/NodeParameterBindingErrorResolver.md)
- [NodePathValueMethodArgumentResolver](classes/NodePathValueMethodArgumentResolver.md)
- [NodeQueryValueMethodArgumentResolver](classes/NodeQueryValueMethodArgumentResolver.md)
- [ResponseEntityView](classes/ResponseEntityView.md)
- [ResponseEntity](classes/ResponseEntity.md)
- [ServerSentEventView](classes/ServerSentEventView.md)
- [NodeSessionValueMethodArgumentResolver](classes/NodeSessionValueMethodArgumentResolver.md)
- [StaticController](classes/StaticController.md)
- [StaticFileView](classes/StaticFileView.md)
- [StaticResourceResolver](classes/StaticResourceResolver.md)

## Interfaces

- [CookieParseOptions](interfaces/CookieParseOptions.md)
- [CORSInterceptorOptions](interfaces/CORSInterceptorOptions.md)
- [CsrfInterceptorOptions](interfaces/CsrfInterceptorOptions.md)
- [Closable](interfaces/Closable.md)
- [GracefulShutdownOptions](interfaces/GracefulShutdownOptions.md)
- [HTTPRequestLimits](interfaces/HTTPRequestLimits.md)
- [ResolvedHTTPRequestLimits](interfaces/ResolvedHTTPRequestLimits.md)
- [HTTPServerAdapter](interfaces/HTTPServerAdapter.md)
- [HTTPServerOptions](interfaces/HTTPServerOptions.md)
- [SocketRequestAuthenticator](interfaces/SocketRequestAuthenticator.md)
- [NodeHTTPServerAdapterOptions](interfaces/NodeHTTPServerAdapterOptions.md)
- [NodeRequest](interfaces/NodeRequest.md)
- [NodeSocketSessionRegistryOptions](interfaces/NodeSocketSessionRegistryOptions.md)
- [SocketLimits](interfaces/SocketLimits.md)
- [ResolvedSocketLimits](interfaces/ResolvedSocketLimits.md)
- [ProblemDetails](interfaces/ProblemDetails.md)
- [ProblemResponseWriter](interfaces/ProblemResponseWriter.md)
- [StaticResourceResult](interfaces/StaticResourceResult.md)

## Type Aliases

- [ArgumentValueConversionContext](type-aliases/ArgumentValueConversionContext.md)
- [ArgumentValueConverter](type-aliases/ArgumentValueConverter.md)
- [ArgumentValueConverterRegistry](type-aliases/ArgumentValueConverterRegistry.md)
- [ConverterResolutionOptions](type-aliases/ConverterResolutionOptions.md)
- [ResolverConverterOption](type-aliases/ResolverConverterOption.md)
- [BodyParseResult](type-aliases/BodyParseResult.md)
- [SocketBackpressurePolicy](type-aliases/SocketBackpressurePolicy.md)
- [SocketBackpressureEvent](type-aliases/SocketBackpressureEvent.md)
- [SocketFanoutEvent](type-aliases/SocketFanoutEvent.md)
- [StaticResourceKind](type-aliases/StaticResourceKind.md)

## Variables

- [identityArgumentValueConverter](variables/identityArgumentValueConverter.md)
- [argumentValueConverters](variables/argumentValueConverters.md)
- [DEFAULT\_MAX\_COOKIES](variables/DEFAULT_MAX_COOKIES.md)
- [DEFAULT\_MAX\_COOKIE\_VALUE\_BYTES](variables/DEFAULT_MAX_COOKIE_VALUE_BYTES.md)
- [CSRF\_COOKIE](variables/CSRF_COOKIE.md)
- [DEFAULT\_HTTP\_REQUEST\_LIMITS](variables/DEFAULT_HTTP_REQUEST_LIMITS.md)
- [NODE\_REQUEST\_ATTRIBUTE](variables/NODE_REQUEST_ATTRIBUTE.md)
- [NODE\_RESPONSE\_ATTRIBUTE](variables/NODE_RESPONSE_ATTRIBUTE.md)
- [DEFAULT\_SOCKET\_LIMITS](variables/DEFAULT_SOCKET_LIMITS.md)
- [ProblemTypes](variables/ProblemTypes.md)
- [NOSNIFF\_HEADER](variables/NOSNIFF_HEADER.md)

## Functions

- [toNumberValue](functions/toNumberValue.md)
- [toBooleanValue](functions/toBooleanValue.md)
- [toDateValue](functions/toDateValue.md)
- [toJSONStringValue](functions/toJSONStringValue.md)
- [createStringSplitConverter](functions/createStringSplitConverter.md)
- [createOptionalConverter](functions/createOptionalConverter.md)
- [resolveConverter](functions/resolveConverter.md)
- [configureNodeArgumentResolvers](functions/configureNodeArgumentResolvers.md)
- [parseCookies](functions/parseCookies.md)
- [gracefulShutdown](functions/gracefulShutdown.md)
- [resolveHTTPRequestLimits](functions/resolveHTTPRequestLimits.md)
- [parseBody](functions/parseBody.md)
- [getNodeRequest](functions/getNodeRequest.md)
- [resolveSocketRegistryOptions](functions/resolveSocketRegistryOptions.md)
- [resolveSocketLimits](functions/resolveSocketLimits.md)
- [assertCloseFrame](functions/assertCloseFrame.md)
- [nodeSocketSession](functions/nodeSocketSession.md)
- [writeProblem](functions/writeProblem.md)
- [isProblemDetails](functions/isProblemDetails.md)
- [toProblemDetails](functions/toProblemDetails.md)
- [problemEntity](functions/problemEntity.md)
- [isResponseEntity](functions/isResponseEntity.md)
- [statusForKind](functions/statusForKind.md)
