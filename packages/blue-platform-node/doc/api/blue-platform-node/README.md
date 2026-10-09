[**@blue/platform-node v0.0.1**](../README.md)

***

[@blue/platform-node](../README.md) / blue-platform-node

# blue-platform-node

## Since

1.0.0

## Author

Jeff Rose

## Classes

- [AESGCMCipher](classes/AESGCMCipher.md)
- [CORSInterceptor](classes/CORSInterceptor.md)
- [CSRFInterceptor](classes/CSRFInterceptor.md)
- [FileSystemResourceLoader](classes/FileSystemResourceLoader.md)
- [FileSystemRouter](classes/FileSystemRouter.md)
- [HTTPResponseViewTarget](classes/HTTPResponseViewTarget.md)
- [HTTPServer](classes/HTTPServer.md)
- [NodeBodyValueMethodArgumentResolver](classes/NodeBodyValueMethodArgumentResolver.md)
- [NodeCookieValueMethodArgumentResolver](classes/NodeCookieValueMethodArgumentResolver.md)
- [NodeDataBindingMethodArgumentResolver](classes/NodeDataBindingMethodArgumentResolver.md)
- [NodeDispatcher](classes/NodeDispatcher.md)
- [NodeEnvironment](classes/NodeEnvironment.md)
- [NodeHeaderValueMethodArgumentResolver](classes/NodeHeaderValueMethodArgumentResolver.md)
- [NodeHTTPServerAdapter](classes/NodeHTTPServerAdapter.md)
- [NodeLastResortErrorResolver](classes/NodeLastResortErrorResolver.md)
- [NodeMultipartContext](classes/NodeMultipartContext.md)
- [NodeMultipartFile](classes/NodeMultipartFile.md)
- [NodeParameterBindingErrorResolver](classes/NodeParameterBindingErrorResolver.md)
- [NodeRequestPartMethodArgumentResolver](classes/NodeRequestPartMethodArgumentResolver.md)
- [NodeRequestSessionValueMethodArgumentResolver](classes/NodeRequestSessionValueMethodArgumentResolver.md)
- [NodeSessionInterceptor](classes/NodeSessionInterceptor.md)
- [NodeSocketSessionRegistry](classes/NodeSocketSessionRegistry.md)
- [OpenAPIDocsAutoConfiguration](classes/OpenAPIDocsAutoConfiguration.md)
- [OpenAPIDocsController](classes/OpenAPIDocsController.md)
- [RateLimitInterceptor](classes/RateLimitInterceptor.md)
- [RequestLimitError](classes/RequestLimitError.md)
- [ResponseEntity](classes/ResponseEntity.md)
- [ResponseEntityView](classes/ResponseEntityView.md)
- [SecurityHeadersInterceptor](classes/SecurityHeadersInterceptor.md)
- [ServerSentEventView](classes/ServerSentEventView.md)
- [StaticController](classes/StaticController.md)
- [StaticFileView](classes/StaticFileView.md)
- [StaticResourceHandler](classes/StaticResourceHandler.md)
- [StaticResourceResolver](classes/StaticResourceResolver.md)
- [SwaggerUIController](classes/SwaggerUIController.md)
- [TrustedProxySet](classes/TrustedProxySet.md)

## Interfaces

- [Closable](interfaces/Closable.md)
- [CookieParseOptions](interfaces/CookieParseOptions.md)
- [CORSInterceptorOptions](interfaces/CORSInterceptorOptions.md)
- [CSRFInterceptorOptions](interfaces/CSRFInterceptorOptions.md)
- [DenialResponseWriter](interfaces/DenialResponseWriter.md)
- [GracefulShutdownOptions](interfaces/GracefulShutdownOptions.md)
- [HTTPRequestLimits](interfaces/HTTPRequestLimits.md)
- [HTTPServerAdapter](interfaces/HTTPServerAdapter.md)
- [HTTPServerOptions](interfaces/HTTPServerOptions.md)
- [MultipartContext](interfaces/MultipartContext.md)
- [MultipartFile](interfaces/MultipartFile.md)
- [MultipartLimits](interfaces/MultipartLimits.md)
- [MultipartParseOptions](interfaces/MultipartParseOptions.md)
- [NodeHTTPServerAdapterOptions](interfaces/NodeHTTPServerAdapterOptions.md)
- [NodeRequest](interfaces/NodeRequest.md)
- [NodeSocketSessionRegistryOptions](interfaces/NodeSocketSessionRegistryOptions.md)
- [OpenAPIDocsAutoConfigurationOptions](interfaces/OpenAPIDocsAutoConfigurationOptions.md)
- [ProblemDetails](interfaces/ProblemDetails.md)
- [ProblemResponseWriter](interfaces/ProblemResponseWriter.md)
- [ResolvedHTTPRequestLimits](interfaces/ResolvedHTTPRequestLimits.md)
- [ResolvedOpenAPIDocsOptions](interfaces/ResolvedOpenAPIDocsOptions.md)
- [ResolvedSocketLimits](interfaces/ResolvedSocketLimits.md)
- [SecurityHeadersInterceptorOptions](interfaces/SecurityHeadersInterceptorOptions.md)
- [SessionCookieOptions](interfaces/SessionCookieOptions.md)
- [SocketLimits](interfaces/SocketLimits.md)
- [SocketRequestAuthenticator](interfaces/SocketRequestAuthenticator.md)
- [StaticHandlerOptions](interfaces/StaticHandlerOptions.md)
- [StaticResolveOptions](interfaces/StaticResolveOptions.md)
- [StaticResourceResult](interfaces/StaticResourceResult.md)

## Type Aliases

- [ArgumentValueConversionContext](type-aliases/ArgumentValueConversionContext.md)
- [ArgumentValueConverter](type-aliases/ArgumentValueConverter.md)
- [ArgumentValueConverterRegistry](type-aliases/ArgumentValueConverterRegistry.md)
- [Backing](type-aliases/Backing.md)
- [BodyParseResult](type-aliases/BodyParseResult.md)
- [ConverterResolutionOptions](type-aliases/ConverterResolutionOptions.md)
- [ResolverConverterOption](type-aliases/ResolverConverterOption.md)
- [SocketBackpressureEvent](type-aliases/SocketBackpressureEvent.md)
- [SocketBackpressurePolicy](type-aliases/SocketBackpressurePolicy.md)
- [SocketFanoutEvent](type-aliases/SocketFanoutEvent.md)
- [StaticEncoding](type-aliases/StaticEncoding.md)
- [StaticResourceKind](type-aliases/StaticResourceKind.md)

## Variables

- [argumentValueConverters](variables/argumentValueConverters.md)
- [BLUE\_SECRET\_KEY](variables/BLUE_SECRET_KEY.md)
- [CONVERSION\_SERVICE](variables/CONVERSION_SERVICE.md)
- [CSRF\_COOKIE](variables/CSRF_COOKIE.md)
- [DEFAULT\_HTTP\_REQUEST\_LIMITS](variables/DEFAULT_HTTP_REQUEST_LIMITS.md)
- [DEFAULT\_MAX\_COOKIE\_VALUE\_BYTES](variables/DEFAULT_MAX_COOKIE_VALUE_BYTES.md)
- [DEFAULT\_MAX\_COOKIES](variables/DEFAULT_MAX_COOKIES.md)
- [DEFAULT\_SOCKET\_LIMITS](variables/DEFAULT_SOCKET_LIMITS.md)
- [HTTP\_SERVER](variables/HTTP_SERVER.md)
- [identityArgumentValueConverter](variables/identityArgumentValueConverter.md)
- [NODE\_REQUEST\_ATTRIBUTE](variables/NODE_REQUEST_ATTRIBUTE.md)
- [NODE\_RESPONSE\_ATTRIBUTE](variables/NODE_RESPONSE_ATTRIBUTE.md)
- [NOSNIFF\_HEADER](variables/NOSNIFF_HEADER.md)
- [ProblemTypes](variables/ProblemTypes.md)
- [RATE\_LIMIT\_KEY](variables/RATE_LIMIT_KEY.md)
- [SESSION\_COOKIE](variables/SESSION_COOKIE.md)
- [SOCKET\_REQUEST\_AUTHENTICATOR](variables/SOCKET_REQUEST_AUTHENTICATOR.md)
- [SOCKET\_SESSION\_REGISTRY](variables/SOCKET_SESSION_REGISTRY.md)

## Functions

- [assertCloseFrame](functions/assertCloseFrame.md)
- [buildSessionCookie](functions/buildSessionCookie.md)
- [buildSessionCookieClear](functions/buildSessionCookieClear.md)
- [clearSessionCookie](functions/clearSessionCookie.md)
- [configureNodeArgumentResolvers](functions/configureNodeArgumentResolvers.md)
- [createNodeArgumentResolvers](functions/createNodeArgumentResolvers.md)
- [createOptionalConverter](functions/createOptionalConverter.md)
- [createStringSplitConverter](functions/createStringSplitConverter.md)
- [finalizeInterceptorDenial](functions/finalizeInterceptorDenial.md)
- [getNodeRequest](functions/getNodeRequest.md)
- [gracefulShutdown](functions/gracefulShutdown.md)
- [hasDuplicateCookie](functions/hasDuplicateCookie.md)
- [isProblemDetails](functions/isProblemDetails.md)
- [isResponseEntity](functions/isResponseEntity.md)
- [negotiateEncoding](functions/negotiateEncoding.md)
- [nodeSocketSession](functions/nodeSocketSession.md)
- [parseBody](functions/parseBody.md)
- [parseBodyRecord](functions/parseBodyRecord.md)
- [parseCookies](functions/parseCookies.md)
- [parseMultipart](functions/parseMultipart.md)
- [problemEntity](functions/problemEntity.md)
- [rateLimit](functions/rateLimit.md)
- [relativeSpecUrl](functions/relativeSpecUrl.md)
- [renderSwaggerUiInitScript](functions/renderSwaggerUiInitScript.md)
- [renderSwaggerUiPage](functions/renderSwaggerUiPage.md)
- [resolveClientAddress](functions/resolveClientAddress.md)
- [resolveConverter](functions/resolveConverter.md)
- [resolveHTTPRequestLimits](functions/resolveHTTPRequestLimits.md)
- [resolveOpenAPIDocsOptions](functions/resolveOpenAPIDocsOptions.md)
- [resolveSocketLimits](functions/resolveSocketLimits.md)
- [resolveSocketRegistryOptions](functions/resolveSocketRegistryOptions.md)
- [setSessionCookie](functions/setSessionCookie.md)
- [statusForKind](functions/statusForKind.md)
- [toBooleanValue](functions/toBooleanValue.md)
- [toDateValue](functions/toDateValue.md)
- [toJSONStringValue](functions/toJSONStringValue.md)
- [toNumberValue](functions/toNumberValue.md)
- [toProblemDetails](functions/toProblemDetails.md)
- [writeProblem](functions/writeProblem.md)

## References

### NodeAutoConfiguration

Re-exports [NodeAutoConfiguration](classes/NodeAutoConfiguration.md)
