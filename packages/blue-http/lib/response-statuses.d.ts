/**
 * @author Jeff Rose
 */
import ResponseStatus from './response-status';
/**
 * @namespace module:http.ResponseStatuses
 */
/**
 * Information Response
 */
/**
 * This interim response indicates that everything so far is OK and that the client should continue the request, or ignore the response if the request is already finished.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.CONTINUE
 */
export declare const CONTINUE: ResponseStatus;
/**
 * This code is sent in response to an `Upgrade` request header from the client, and indicates the protocol the server is switching to.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.SWITCHING_PROTOCOL
 */
export declare const SWITCHING_PROTOCOL: ResponseStatus;
/**
 * This code indicates that the server has received and is processing the request, but no response is available yet.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.PROCESSING
 */
export declare const PROCESSING: ResponseStatus;
/**
 * This status code is primarily intended to be used with the `Link` header, letting the user agent start preloading resources while the server prepares a response.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.EARLY_HINTS
 */
export declare const EARLY_HINTS: ResponseStatus;
/**
 * Successful Responses
 */
/**
 * The request has succeeded. The meaning of the success depends on the HTTP method:
 * * `GET`: The resource has been fetched and is transmitted in the message body.
 * * `HEAD`: The entity headers are in the message body.
 * * `PUT` or `POST`: The resource describing the result of the action is transmitted in the message body.
 * * `TRACE`: The message body contains the request message as received by the server.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.OK
 */
export declare const OK: ResponseStatus;
/**
 * The request has succeeded and a new resource has been created as a result. This is typically the response sent after `POST` requests, or some `PUT` requests.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.CREATED
 */
export declare const CREATED: ResponseStatus;
/**
 * The request has been received but not yet acted upon. It is noncommittal, since there is no way in HTTP to later send an asynchronous response indicating the outcome of the request. It is intended for cases where another process or server handles the request, or for batch processing.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.ACCEPTED
 */
export declare const ACCEPTED: ResponseStatus;
/**
 * This response code means the returned meta-information is not exactly the same as is available from the origin server, but is collected from a local or a third-party copy. This is mostly used for mirrors or backups of another resource. Except for that specific case, the "200 OK" response is preferred to this status.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.NON_AUTHORITATIVE_INFORMATION
 */
export declare const NON_AUTHORITATIVE_INFORMATION: ResponseStatus;
/**
 * There is no content to send for this request, but the headers may be useful. The user-agent may update its cached headers for this resource with the new ones.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.NO_CONTENT
 */
export declare const NO_CONTENT: ResponseStatus;
/**
 * Tells the user-agent to reset the document which sent this request.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.RESET_CONTENT
 */
export declare const RESET_CONTENT: ResponseStatus;
/**
 * This response code is used when the `Range` header is sent from the client to request only part of a resource.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.PARTIAL_CONTENT
 */
export declare const PARTIAL_CONTENT: ResponseStatus;
/**
 * Conveys information about multiple resources, for situations where multiple status codes might be appropriate..
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.MULTI_STATUS
 */
export declare const MULTI_STATUS: ResponseStatus;
/**
 * Used inside a `<dav:propstat>` response element to avoid repeatedly enumerating the internal members of multiple bindings to the same collection.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.ALREADY_REPORTED
 */
export declare const ALREADY_REPORTED: ResponseStatus;
/**
 * The server has fulfilled a `GET` request for the resource, and the response is a representation of the result of one or more instance-manipulations applied to the current instance.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.IM_USED
 */
export declare const IM_USED: ResponseStatus;
/**
 * Redirection Responses
 */
/**
 * The request has more than one possible response. The user-agent or user should choose one of them. (There is no standardized way of choosing one of the responses, but HTML links to the possibilities are recommended so the user can pick.)
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.MULTIPLE_CHOICE
 */
export declare const MULTIPLE_CHOICE: ResponseStatus;
/**
 * The URL of the requested resource has been changed permanently. The new URL is given in the response.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.MOVED_PERMANENTLY
 */
export declare const MOVED_PERMANENTLY: ResponseStatus;
/**
 * This response code means that the URI of requested resource has been changed _temporarily_. Further changes in the URI might be made in the future. Therefore, this same URI should be used by the client in future requests.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.FOUND
 */
export declare const FOUND: ResponseStatus;
/**
 * The server sent this response to direct the client to get the requested resource at another URI with a `GET` request.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.SEE_OTHER
 */
export declare const SEE_OTHER: ResponseStatus;
/**
 * This is used for caching purposes. It tells the client that the response has not been modified, so the client can continue to use the same cached version of the response.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.NOT_MODIFIED
 */
export declare const NOT_MODIFIED: ResponseStatus;
/**
 * Defined in a previous version of the HTTP specification to indicate that a requested response must be accessed by a proxy. It has been deprecated due to security concerns regarding in-band configuration of a proxy.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.USE_PROXY
 */
export declare const USE_PROXY: ResponseStatus;
/**
 * This response code is no longer used; it is just reserved. It was used in a previous version of the HTTP/1.1 specification. Originally meant "Subsequent requests should use the specified proxy."
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.SWITCH_PROXY
 */
export declare const SWITCH_PROXY: ResponseStatus;
/**
 * The server sends this response to direct the client to get the requested resource at another URI with same method that was used in the prior request. This has the same semantics as the `302 Found` HTTP response code, with the exception that the user agent must not change the HTTP method used: If a `POST` was used in the first request, a `POST` must be used in the second request.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.TEMPORARY_REDIRECT
 */
export declare const TEMPORARY_REDIRECT: ResponseStatus;
/**
 * This means that the resource is now permanently located at another URI, specified by the `Location:` HTTP Response header. This has the same semantics as the `301 Moved Permanently` HTTP response code, with the exception that the user agent must not change the HTTP method used: If a `POST` was used in the first request, a `POST` must be used in the second request.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.PERMANENT_REDIRECT
 */
export declare const PERMANENT_REDIRECT: ResponseStatus;
/**
 * Client Error Responses
 */
/**
 * The server could not understand the request due to invalid syntax.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.BAD_REQUEST
 */
export declare const BAD_REQUEST: ResponseStatus;
/**
 * Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated". That is, the client must authenticate itself to get the requested response.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.UNAUTHORIZED
 */
export declare const UNAUTHORIZED: ResponseStatus;
/**
 * This response code is reserved for future use. The initial aim for creating this code was using it for digital payment systems, however this status code is used very rarely and no standard convention exists.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.PAYMENT_REQUIRED
 */
export declare const PAYMENT_REQUIRED: ResponseStatus;
/**
 * The client does not have access rights to the content; that is, it is unauthorized, so the server is refusing to give the requested resource. Unlike 401, the client's identity is known to the server.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.FORBIDDEN
 */
export declare const FORBIDDEN: ResponseStatus;
/**
 * The server can not find the requested resource. In the browser, this means the URL is not recognized. In an API, this can also mean that the endpoint is valid but the resource itself does not exist. Servers may also send this response instead of 403 to hide the existence of a resource from an unauthorized client. This response code is probably the most famous one due to its frequent occurrence on the web.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.NOT_FOUND
 */
export declare const NOT_FOUND: ResponseStatus;
/**
 * The request method is known by the server but has been disabled and cannot be used. For example, an API may forbid `DELETE`-ing a resource. The two mandatory methods, `GET` and `HEAD`, must never be disabled and should not return this error code.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.METHOD_NOT_ALLOWED
 */
export declare const METHOD_NOT_ALLOWED: ResponseStatus;
/**
 * This response is sent when the web server, after performing server-driven content negotiation, doesn't find any content that conforms to the criteria given by the user agent.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.NOT_ACCEPTABLE
 */
export declare const NOT_ACCEPTABLE: ResponseStatus;
/**
 * This is similar to 401 but authentication is needed to be done by a proxy.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.PROXY_AUTHENTICATION_REQUIRED
 */
export declare const PROXY_AUTHENTICATION_REQUIRED: ResponseStatus;
/**
 * This response is sent on an idle connection by some servers, even without any previous request by the client. It means that the server would like to shut down this unused connection. This response is used much more since some browsers, like Chrome, Firefox 27+, or IE9, use HTTP pre-connection mechanisms to speed up surfing. Also note that some servers merely shut down the connection without sending this message.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.REQUEST_TIMEOUT
 */
export declare const REQUEST_TIMEOUT: ResponseStatus;
/**
 * This response is sent when a request conflicts with the current state of the server.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.CONFLICT
 */
export declare const CONFLICT: ResponseStatus;
/**
 * This response is sent when the requested content has been permanently deleted from server, with no forwarding address. Clients are expected to remove their caches and links to the resource. The HTTP specification intends this status code to be used for "limited-time, promotional services". APIs should not feel compelled to indicate resources that have been deleted with this status code.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.GONE
 */
export declare const GONE: ResponseStatus;
/**
 * Server rejected the request because the `Content-Length` header field is not defined and the server requires it.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.LENGTH_REQUIRED
 */
export declare const LENGTH_REQUIRED: ResponseStatus;
/**
 * The client has indicated preconditions in its headers which the server does not meet.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.PRECONDITION_FAILED
 */
export declare const PRECONDITION_FAILED: ResponseStatus;
/**
 * Request entity is larger than limits defined by server; the server might close the connection or return an `Retry-After` header field.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.PAYLOAD_TOO_LARGE
 */
export declare const PAYLOAD_TOO_LARGE: ResponseStatus;
/**
 * The URI requested by the client is longer than the server is willing to interpret.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.URI_TOO_LONG
 */
export declare const URI_TOO_LONG: ResponseStatus;
/**
 * The media format of the requested data is not supported by the server, so the server is rejecting the request.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.UNSUPPORTED_MEDIA_TYPE
 */
export declare const UNSUPPORTED_MEDIA_TYPE: ResponseStatus;
/**
 * The range specified by the Range header field in the request can't be fulfilled; it's possible that the range is outside the size of the target URI's data.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.RANGE_NOT_SATISFIED
 */
export declare const RANGE_NOT_SATISFIED: ResponseStatus;
/**
 * This response code means the expectation indicated by the Expect request header field can't be met by the server.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.EXPECTATION_FAILED
 */
export declare const EXPECTATION_FAILED: ResponseStatus;
/**
 * The server refuses the attempt to brew coffee with a teapot.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.IM_A_TEAPOT
 */
export declare const IM_A_TEAPOT: ResponseStatus;
/**
 * The request was directed at a server that is not able to produce a response. This can be sent by a server that is not configured to produce responses for the combination of scheme and authority that are included in the request URI.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.MISDIRECTED
 */
export declare const MISDIRECTED: ResponseStatus;
/**
 * The request was well-formed but was unable to be followed due to semantic errors.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.UNPROCESSABLE_ENTITY
 */
export declare const UNPROCESSABLE_ENTITY: ResponseStatus;
/**
 * The resource that is being accessed is locked.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.LOCKED
 */
export declare const LOCKED: ResponseStatus;
/**
 * The request failed due to failure of a previous request.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.FAILED_DEPENDENCY
 */
export declare const FAILED_DEPENDENCY: ResponseStatus;
/**
 * Indicates that the server is unwilling to risk processing a request that might be replayed.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.TOO_EARLY
 */
export declare const TOO_EARLY: ResponseStatus;
/**
 * The server refuses to perform the request using the current protocol but might be willing to do so after the client upgrades to a different protocol. The server sends an `Upgrade` header in a 426 response to indicate the required protocol(s).
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.UPGRADE_REQUIRED
 */
export declare const UPGRADE_REQUIRED: ResponseStatus;
/**
 * The origin server requires the request to be conditional. This response is intended to prevent the 'lost update' problem, where a client `GET`s a resource's state, modifies it, and `PUT`s it back to the server, when meanwhile a third party has modified the state on the server, leading to a conflict.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.PRECONDITION_REQUIRED
 */
export declare const PRECONDITION_REQUIRED: ResponseStatus;
/**
 * The user has sent too many requests in a given amount of time ("rate limiting").
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.TOO_MANY_REQUESTS
 */
export declare const TOO_MANY_REQUESTS: ResponseStatus;
/**
 * The server is unwilling to process the request because its header fields are too large. The request may be resubmitted after reducing the size of the request header fields.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.REQUEST_HEADER_FIELDS_TOO_LARGE
 */
export declare const REQUEST_HEADER_FIELDS_TOO_LARGE: ResponseStatus;
/**
 * The user-agent requested a resource that cannot legally be provided, such as a web page censored by a government.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.UNAVAILABLE_FOR_LEGAL_REASONS
 */
export declare const UNAVAILABLE_FOR_LEGAL_REASONS: ResponseStatus;
/**
 * Server Error Responses
 */
/**
 * The server has encountered a situation it doesn't know how to handle.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.INTERNAL_SERVER_ERROR
 */
export declare const INTERNAL_SERVER_ERROR: ResponseStatus;
/**
 * The request method is not supported by the server and cannot be handled. The only methods that servers are required to support (and therefore that must not return this code) are `GET` and `HEAD`.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.NOT_IMPLEMENTED
 */
export declare const NOT_IMPLEMENTED: ResponseStatus;
/**
 * This error response means that the server, while working as a gateway to get a response needed to handle the request, got an invalid response.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.BAD_GATEWAY
 */
export declare const BAD_GATEWAY: ResponseStatus;
/**
 * The server is not ready to handle the request. Common causes are a server that is down for maintenance or that is overloaded. Note that together with this response, a user-friendly page explaining the problem should be sent. This responses should be used for temporary conditions and the `Retry-After:` HTTP header should, if possible, contain the estimated time before the recovery of the service. The webmaster must also take care about the caching-related headers that are sent along with this response, as these temporary condition responses should usually not be cached.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.SERVICE_UNAVAILABLE
 */
export declare const SERVICE_UNAVAILABLE: ResponseStatus;
/**
 * This error response is given when the server is acting as a gateway and cannot get a response in time.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.GATEWAY_TIMEOUT
 */
export declare const GATEWAY_TIMEOUT: ResponseStatus;
/**
 * The HTTP version used in the request is not supported by the server.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.HTTP_VERSION_NOT_SUPPORTED
 */
export declare const HTTP_VERSION_NOT_SUPPORTED: ResponseStatus;
/**
 * The server has an internal configuration error: the chosen variant resource is configured to engage in transparent content negotiation itself, and is therefore not a proper end point in the negotiation process.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.VARIANT_ALSO_NEGOTIATES
 */
export declare const VARIANT_ALSO_NEGOTIATES: ResponseStatus;
/**
 * The method could not be performed on the resource because the server is unable to store the representation needed to successfully complete the request.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.INSUFFICIENT_STORAGE
 */
export declare const INSUFFICIENT_STORAGE: ResponseStatus;
/**
 * The server detected an infinite loop while processing the request.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.LOOP_DETECTED
 */
export declare const LOOP_DETECTED: ResponseStatus;
/**
 * Further extensions to the request are required for the server to fulfil it.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.NOT_EXTENDED
 */
export declare const NOT_EXTENDED: ResponseStatus;
/**
 * The 511 status code indicates that the client needs to authenticate to gain network access.
 * @const {module:http.ResponseStatus} module:http.ResponseStatuses.NETWORK_AUTHENTICATION_REQUIRED
 */
export declare const NETWORK_AUTHENTICATION_REQUIRED: ResponseStatus;
//# sourceMappingURL=response-statuses.d.ts.map