/**
 * RFC 9457 problem-type URIs used by the HTTP error contract.
 *
 * The `urn:ndigo:` scheme is a self-contained placeholder (AD-10); real HTTPS
 * URIs replace it before the first public release. Slugs use `-` separators.
 */
export const ProblemTypes = {
    bindingFailed: 'urn:ndigo:binding-failed',
    validationFailed: 'urn:ndigo:validation-failed',
    unauthorized: 'urn:ndigo:unauthorized',
    forbidden: 'urn:ndigo:forbidden',
    notFound: 'urn:ndigo:not-found',
    methodNotAllowed: 'urn:ndigo:method-not-allowed',
    notAcceptable: 'urn:ndigo:not-acceptable',
    payloadTooLarge: 'urn:ndigo:payload-too-large',
    requestTooLarge: 'urn:ndigo:request-too-large',
    fieldTooLarge: 'urn:ndigo:field-too-large',
    fileTooLarge: 'urn:ndigo:file-too-large',
    tooManyFiles: 'urn:ndigo:too-many-files',
    tooManyFields: 'urn:ndigo:too-many-fields',
    tooManyParts: 'urn:ndigo:too-many-parts',
    unsupportedMediaType: 'urn:ndigo:unsupported-media-type',
    malformedBody: 'urn:ndigo:malformed-body',
    malformedUrl: 'urn:ndigo:malformed-url',
    malformedMultipart: 'urn:ndigo:malformed-multipart',
    missingBoundary: 'urn:ndigo:missing-boundary',
    headersTooLarge: 'urn:ndigo:headers-too-large',
    requestTimeout: 'urn:ndigo:request-timeout',
    requestAborted: 'urn:ndigo:request-aborted',
    rateLimited: 'urn:ndigo:rate-limited',
    serviceUnavailable: 'urn:ndigo:service-unavailable',
    internalError: 'urn:ndigo:internal-error',
} as const;
