/**
 * @author Jeff Rose
 */
import { HTTPHeader } from './http-header';
/**
 * @namespace module:http.HTTPHeaders
 */
/**
 * Authentication
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.WWW_AUTHENTICATE
 */
export declare const WWW_AUTHENTICATE: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.AUTHORIZATION
 */
export declare const AUTHORIZATION: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.PROXY_AUTHENTICATE
 */
export declare const PROXY_AUTHENTICATE: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.PROXY_AUTHORIZATION
 */
export declare const PROXY_AUTHORIZATION: HTTPHeader;
/**
 * Caching
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.AGE
 */
export declare const AGE: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CACHE_CONTROL
 */
export declare const CACHE_CONTROL: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CLEAR_SITE_DATA
 */
export declare const CLEAR_SITE_DATA: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.EXPIRES
 */
export declare const EXPIRES: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.PRAGMA
 */
export declare const PRAGMA: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.WARNING
 */
export declare const WARNING: HTTPHeader;
/**
 * Client Hints
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCEPT_CH
 */
export declare const ACCEPT_CH: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCEPT_CH_LIFETIME
 */
export declare const ACCEPT_CH_LIFETIME: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.EARLY_DATA
 */
export declare const EARLY_DATA: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.DEVICE_MEMORY
 */
export declare const DEVICE_MEMORY: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SAVE_DATA
 */
export declare const SAVE_DATA: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.VIEWPORT_WIDTH
 */
export declare const VIEWPORT_WIDTH: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.WIDTH
 */
export declare const WIDTH: HTTPHeader;
/**
 * Conditionals
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.LAST_MODIFIED
 */
export declare const LAST_MODIFIED: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ETAG
 */
export declare const ETAG: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.IF_MATCH
 */
export declare const IF_MATCH: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.IF_NONE_MATCH
 */
export declare const IF_NONE_MATCH: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.IF_MODIFIED_SINCE
 */
export declare const IF_MODIFIED_SINCE: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.IF_UNMODIFIED_SINCE
 */
export declare const IF_UNMODIFIED_SINCE: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.VARY
 */
export declare const VARY: HTTPHeader;
/**
 * Content management
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONNECTION
 */
export declare const CONNECTION: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.KEEP_ALIVE
 */
export declare const KEEP_ALIVE: HTTPHeader;
/**
 * Content negotiation
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCEPT
 */
export declare const ACCEPT: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCEPT_CHARSET
 */
export declare const ACCEPT_CHARSET: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCEPT_ENCODING
 */
export declare const ACCEPT_ENCODING: HTTPHeader;
/**
 * Controls
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.EXPECT
 */
export declare const EXPECT: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.MAX_FORWARDS
 */
export declare const MAX_FORWARDS: HTTPHeader;
/**
 * Cookies
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.COOKIE
 */
export declare const COOKIE: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SET_COOKIE
 */
export declare const SET_COOKIE: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.COOKIE2
 */
export declare const COOKIE2: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SET_COOKIE2
 */
export declare const SET_COOKIE2: HTTPHeader;
/**
 * CORS
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCESS_CONTROL_ALLOW_ORIGIN
 */
export declare const ACCESS_CONTROL_ALLOW_ORIGIN: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS
 */
export declare const ACCESS_CONTROL_ALLOW_CREDENTIALS: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCESS_CONTROL_ALLOW_HEADERS
 */
export declare const ACCESS_CONTROL_ALLOW_HEADERS: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCESS_CONTROL_ALLOW_METHODS
 */
export declare const ACCESS_CONTROL_ALLOW_METHODS: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCESS_CONTROL_EXPOSE_HEADERS
 */
export declare const ACCESS_CONTROL_EXPOSE_HEADERS: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCESS_CONTROL_MAX_AGE
 */
export declare const ACCESS_CONTROL_MAX_AGE: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCESS_CONTROL_REQUEST_HEADERS
 */
export declare const ACCESS_CONTROL_REQUEST_HEADERS: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCESS_CONTROL_REQUEST_METHOD
 */
export declare const ACCESS_CONTROL_REQUEST_METHOD: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ORIGIN
 */
export declare const ORIGIN: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.TIMING_ALLOW_ORIGIN
 */
export declare const TIMING_ALLOW_ORIGIN: HTTPHeader;
/**
 * Do Not Track
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.DNT
 */
export declare const DNT: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.TK
 */
export declare const TK: HTTPHeader;
/**
 * Downloads
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_DISPOSITION
 */
export declare const CONTENT_DISPOSITION: HTTPHeader;
/**
 * Message body information
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_LENGTH
 */
export declare const CONTENT_LENGTH: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_TYPE
 */
export declare const CONTENT_TYPE: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_ENCODING
 */
export declare const CONTENT_ENCODING: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_LANGUAGE
 */
export declare const CONTENT_LANGUAGE: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_LOCATION
 */
export declare const CONTENT_LOCATION: HTTPHeader;
/**
 * Proxies
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.FORWARDED
 */
export declare const FORWARDED: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_FORWARDED_FOR
 */
export declare const X_FORWARDED_FOR: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_FORWARDED_HOST
 */
export declare const X_FORWARDED_HOST: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_FORWARDED_PROTO
 */
export declare const X_FORWARDED_PROTO: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.VIA
 */
export declare const VIA: HTTPHeader;
/**
 * Redirects
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.LOCATION
 */
export declare const LOCATION: HTTPHeader;
/**
 * Request context
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.FROM
 */
export declare const FROM: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.HOST
 */
export declare const HOST: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.REFERER
 */
export declare const REFERER: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.REFERER_POLICY
 */
export declare const REFERER_POLICY: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.USER_AGENT
 */
export declare const USER_AGENT: HTTPHeader;
/**
 * Response context
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ALLOW
 */
export declare const ALLOW: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SERVER
 */
export declare const SERVER: HTTPHeader;
/**
 * Range requests
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCEPT_RANGES
 */
export declare const ACCEPT_RANGES: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.RANGE
 */
export declare const RANGE: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.IF_RANGE
 */
export declare const IF_RANGE: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_RANGE
 */
export declare const CONTENT_RANGE: HTTPHeader;
/**
 * Security
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CROSS_ORIGIN_EMBEDDER_POLICY
 */
export declare const CROSS_ORIGIN_EMBEDDER_POLICY: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CROSS_ORIGIN_OPENER_POLICY
 */
export declare const CROSS_ORIGIN_OPENER_POLICY: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CROSS_ORIGIN_RESOURCE_POLICY
 */
export declare const CROSS_ORIGIN_RESOURCE_POLICY: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_SECURITY_POLICY
 */
export declare const CONTENT_SECURITY_POLICY: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_SECURITY_POLICY_REPORT_ONLY
 */
export declare const CONTENT_SECURITY_POLICY_REPORT_ONLY: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.EXPECT_CT
 */
export declare const EXPECT_CT: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.FEATURE_POLICY
 */
export declare const FEATURE_POLICY: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ORIGIN_ISOLATION
 */
export declare const ORIGIN_ISOLATION: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.STRICT_TRANSPORT_SECURITY
 */
export declare const STRICT_TRANSPORT_SECURITY: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.UGPRADE_INSECURE_REQUESTS
 */
export declare const UGPRADE_INSECURE_REQUESTS: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_CONTENT_TYPE_OPTIONS
 */
export declare const X_CONTENT_TYPE_OPTIONS: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_DOWNLOAD_OPTIONS
 */
export declare const X_DOWNLOAD_OPTIONS: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_FRAME_OPTIONS
 */
export declare const X_FRAME_OPTIONS: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_PERMITTED_CROSS_DOMAIN_POLICIES
 */
export declare const X_PERMITTED_CROSS_DOMAIN_POLICIES: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_POWERED_BY
 */
export declare const X_POWERED_BY: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_XSS_PROTECTION
 */
export declare const X_XSS_PROTECTION: HTTPHeader;
/**
 * HTTP Public Key Pinning (HPKP)
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.PUBLIC_KEY_PINS
 */
export declare const PUBLIC_KEY_PINS: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.PUBLIC_KEY_PINS_REPORT_ONLY
 */
export declare const PUBLIC_KEY_PINS_REPORT_ONLY: HTTPHeader;
/**
 * Fetch metadata request headers
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_FETCH_SITE
 */
export declare const SEC_FETCH_SITE: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_FETCH_MODE
 */
export declare const SEC_FETCH_MODE: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_FETCH_USER
 */
export declare const SEC_FETCH_USER: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_FETCH_DEST
 */
export declare const SEC_FETCH_DEST: HTTPHeader;
/**
 * Server-sent requests
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.LAST_EVENT_ID
 */
export declare const LAST_EVENT_ID: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.NEL
 */
export declare const NEL: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.PING_FROM
 */
export declare const PING_FROM: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.PING_TO
 */
export declare const PING_TO: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.REPORT_TO
 */
export declare const REPORT_TO: HTTPHeader;
/**
 * Transfer coding
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.TRANSFER_ENCODING
 */
export declare const TRANSFER_ENCODING: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.TE
 */
export declare const TE: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.TRAILER
 */
export declare const TRAILER: HTTPHeader;
/**
 * Websockets
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_WEBSOCKET_KEY
 */
export declare const SEC_WEBSOCKET_KEY: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_WEBSOCKET_EXTENSIONS
 */
export declare const SEC_WEBSOCKET_EXTENSIONS: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_WEBSOCKET_ACCEPT
 */
export declare const SEC_WEBSOCKET_ACCEPT: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_WEBSOCKET_PROTOCOL
 */
export declare const SEC_WEBSOCKET_PROTOCOL: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_WEBSOCKET_VERSION
 */
export declare const SEC_WEBSOCKET_VERSION: HTTPHeader;
/**
 * Other
 */
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCEPT_PUSH_POLICY
 */
export declare const ACCEPT_PUSH_POLICY: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCEPT_SIGNATURE
 */
export declare const ACCEPT_SIGNATURE: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ALT_SVC
 */
export declare const ALT_SVC: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.DATE
 */
export declare const DATE: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.LARGE_ALLOCATION
 */
export declare const LARGE_ALLOCATION: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.LINK
 */
export declare const LINK: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.PUSH_POLICY
 */
export declare const PUSH_POLICY: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.RETRY_AFTER
 */
export declare const RETRY_AFTER: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SIGNATURE
 */
export declare const SIGNATURE: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SIGNED_HEADERS
 */
export declare const SIGNED_HEADERS: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SERVER_TIMING
 */
export declare const SERVER_TIMING: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SERVICE_WORKER_ALLOWED
 */
export declare const SERVICE_WORKER_ALLOWED: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SOURCEMAP
 */
export declare const SOURCEMAP: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.UPGRADE
 */
export declare const UPGRADE: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_DNS_PREFETCH_CONTROL
 */
export declare const X_DNS_PREFETCH_CONTROL: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_PINGBACK
 */
export declare const X_PINGBACK: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_REQUESTED_WITH
 */
export declare const X_REQUESTED_WITH: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_ROBOTS_TAG
 */
export declare const X_ROBOTS_TAG: HTTPHeader;
/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_UA_COMPATIBLE
 */
export declare const X_UA_COMPATIBLE: HTTPHeader;
//# sourceMappingURL=http-headers.d.ts.map