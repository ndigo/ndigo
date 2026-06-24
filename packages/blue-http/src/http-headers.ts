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
export const WWW_AUTHENTICATE = new HTTPHeader('WWW-Authenticate');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.AUTHORIZATION
 */
export const AUTHORIZATION = new HTTPHeader('Authorization');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.PROXY_AUTHENTICATE
 */
export const PROXY_AUTHENTICATE = new HTTPHeader('Proxy-Authenticate');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.PROXY_AUTHORIZATION
 */
export const PROXY_AUTHORIZATION = new HTTPHeader('Proxy-Authorization');

/**
 * Caching
 */

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.AGE
 */
export const AGE = new HTTPHeader('Age');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CACHE_CONTROL
 */
export const CACHE_CONTROL = new HTTPHeader('Cache-Control');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CLEAR_SITE_DATA
 */
export const CLEAR_SITE_DATA = new HTTPHeader('Clear-Site-Data');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.EXPIRES
 */
export const EXPIRES = new HTTPHeader('Expires');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.PRAGMA
 */
export const PRAGMA = new HTTPHeader('Pragma');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.WARNING
 */
export const WARNING = new HTTPHeader('Warning');

/**
 * Client Hints
 */

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCEPT_CH
 */
export const ACCEPT_CH = new HTTPHeader('Accept-CH');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCEPT_CH_LIFETIME
 */
export const ACCEPT_CH_LIFETIME = new HTTPHeader('Accept-CH-Lifetime');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.EARLY_DATA
 */
export const EARLY_DATA = new HTTPHeader('Early-Data');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.DEVICE_MEMORY
 */
export const DEVICE_MEMORY = new HTTPHeader('Device-Memory');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SAVE_DATA
 */
export const SAVE_DATA = new HTTPHeader('Save-Data');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.VIEWPORT_WIDTH
 */
export const VIEWPORT_WIDTH = new HTTPHeader('Viewport-Width');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.WIDTH
 */
export const WIDTH = new HTTPHeader('Width');

/**
 * Conditionals
 */

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.LAST_MODIFIED
 */
export const LAST_MODIFIED = new HTTPHeader('Last-Modified');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ETAG
 */
export const ETAG = new HTTPHeader('ETag');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.IF_MATCH
 */
export const IF_MATCH = new HTTPHeader('If-Match');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.IF_NONE_MATCH
 */
export const IF_NONE_MATCH = new HTTPHeader('If-None-Match');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.IF_MODIFIED_SINCE
 */
export const IF_MODIFIED_SINCE = new HTTPHeader('If-Modified-Since');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.IF_UNMODIFIED_SINCE
 */
export const IF_UNMODIFIED_SINCE = new HTTPHeader('If-Unmodified-Since');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.VARY
 */
export const VARY = new HTTPHeader('Vary');

/**
 * Content management
 */

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONNECTION
 */
export const CONNECTION = new HTTPHeader('Connection');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.KEEP_ALIVE
 */
export const KEEP_ALIVE = new HTTPHeader('Keep-Alive');

/**
 * Content negotiation
 */

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCEPT
 */
export const ACCEPT = new HTTPHeader('Accept');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCEPT_CHARSET
 */
export const ACCEPT_CHARSET = new HTTPHeader('Accept-Charset');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCEPT_ENCODING
 */
export const ACCEPT_ENCODING = new HTTPHeader('Accept-Encoding');

/**
 * Controls
 */

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.EXPECT
 */
export const EXPECT = new HTTPHeader('Expect');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.MAX_FORWARDS
 */
export const MAX_FORWARDS = new HTTPHeader('Max-Forwards');

/**
 * Cookies
 */

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.COOKIE
 */
export const COOKIE = new HTTPHeader('Cookie');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SET_COOKIE
 */
export const SET_COOKIE = new HTTPHeader('Set-Cookie');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.COOKIE2
 */
export const COOKIE2 = new HTTPHeader('Cookie2');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SET_COOKIE2
 */
export const SET_COOKIE2 = new HTTPHeader('Set-Cookie2');

/**
 * CORS
 */

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCESS_CONTROL_ALLOW_ORIGIN
 */
export const ACCESS_CONTROL_ALLOW_ORIGIN = new HTTPHeader('Access-Control-Allow-Origin');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS
 */
export const ACCESS_CONTROL_ALLOW_CREDENTIALS = new HTTPHeader('Access-Control-Allow-Credentials');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCESS_CONTROL_ALLOW_HEADERS
 */
export const ACCESS_CONTROL_ALLOW_HEADERS = new HTTPHeader('Access-Control-Allow-Headers');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCESS_CONTROL_ALLOW_METHODS
 */
export const ACCESS_CONTROL_ALLOW_METHODS = new HTTPHeader('Access-Control-Allow-Methods');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCESS_CONTROL_EXPOSE_HEADERS
 */
export const ACCESS_CONTROL_EXPOSE_HEADERS = new HTTPHeader('Access-Control-Expose-Headers');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCESS_CONTROL_MAX_AGE
 */
export const ACCESS_CONTROL_MAX_AGE = new HTTPHeader('Access-Control-Max-Age');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCESS_CONTROL_REQUEST_HEADERS
 */
export const ACCESS_CONTROL_REQUEST_HEADERS = new HTTPHeader('Access-Control-Request-Headers');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCESS_CONTROL_REQUEST_METHOD
 */
export const ACCESS_CONTROL_REQUEST_METHOD = new HTTPHeader('Access-Control-Request-Method');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ORIGIN
 */
export const ORIGIN = new HTTPHeader('Origin');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.TIMING_ALLOW_ORIGIN
 */
export const TIMING_ALLOW_ORIGIN = new HTTPHeader('Timing-Allow-Origin');

/**
 * Do Not Track
 */

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.DNT
 */
export const DNT = new HTTPHeader('DNT');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.TK
 */
export const TK = new HTTPHeader('Tk');

/**
 * Downloads
 */

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_DISPOSITION
 */
export const CONTENT_DISPOSITION = new HTTPHeader('Content-Disposition');

/**
 * Message body information
 */

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_LENGTH
 */
export const CONTENT_LENGTH = new HTTPHeader('Content-Length');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_TYPE
 */
export const CONTENT_TYPE = new HTTPHeader('Content-Type');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_ENCODING
 */
export const CONTENT_ENCODING = new HTTPHeader('Content-Encoding');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_LANGUAGE
 */
export const CONTENT_LANGUAGE = new HTTPHeader('Content-Language');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_LOCATION
 */
export const CONTENT_LOCATION = new HTTPHeader('Content-Location');

/**
 * Proxies
 */

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.FORWARDED
 */
export const FORWARDED = new HTTPHeader('Forwarded');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_FORWARDED_FOR
 */
export const X_FORWARDED_FOR = new HTTPHeader('X-Forwarded-For');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_FORWARDED_HOST
 */
export const X_FORWARDED_HOST = new HTTPHeader('X-Forwarded-Host');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_FORWARDED_PROTO
 */
export const X_FORWARDED_PROTO = new HTTPHeader('X-Forwarded-Proto');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.VIA
 */
export const VIA = new HTTPHeader('Via');

/**
 * Redirects
 */

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.LOCATION
 */
export const LOCATION = new HTTPHeader('Location');

/**
 * Request context
 */

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.FROM
 */
export const FROM = new HTTPHeader('From');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.HOST
 */
export const HOST = new HTTPHeader('Host');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.REFERER
 */
export const REFERER = new HTTPHeader('Referer');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.REFERER_POLICY
 */
export const REFERER_POLICY = new HTTPHeader('Referer-Policy');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.USER_AGENT
 */
export const USER_AGENT = new HTTPHeader('User-Agent');

/**
 * Response context
 */

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ALLOW
 */
export const ALLOW = new HTTPHeader('Allow');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SERVER
 */
export const SERVER = new HTTPHeader('Server');

/**
 * Range requests
 */

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCEPT_RANGES
 */
export const ACCEPT_RANGES = new HTTPHeader('Accept-Ranges');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.RANGE
 */
export const RANGE = new HTTPHeader('Range');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.IF_RANGE
 */
export const IF_RANGE = new HTTPHeader('If-Range');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_RANGE
 */
export const CONTENT_RANGE = new HTTPHeader('Content-Range');

/**
 * Security
 */

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CROSS_ORIGIN_EMBEDDER_POLICY
 */
export const CROSS_ORIGIN_EMBEDDER_POLICY = new HTTPHeader('Cross-Origin-Embedder-Policy');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CROSS_ORIGIN_OPENER_POLICY
 */
export const CROSS_ORIGIN_OPENER_POLICY = new HTTPHeader('Cross-Origin-Opener-Policy');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CROSS_ORIGIN_RESOURCE_POLICY
 */
export const CROSS_ORIGIN_RESOURCE_POLICY = new HTTPHeader('Cross-Origin-Resource-Policy');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_SECURITY_POLICY
 */
export const CONTENT_SECURITY_POLICY = new HTTPHeader('Content-Security-Policy');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.CONTENT_SECURITY_POLICY_REPORT_ONLY
 */
export const CONTENT_SECURITY_POLICY_REPORT_ONLY = new HTTPHeader('Content-Security-Policy-Report-Only');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.EXPECT_CT
 */
export const EXPECT_CT = new HTTPHeader('Expect-CT');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.FEATURE_POLICY
 */
export const FEATURE_POLICY = new HTTPHeader('Feature-Policy');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ORIGIN_ISOLATION
 */
export const ORIGIN_ISOLATION = new HTTPHeader('Origin-Isolation');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.STRICT_TRANSPORT_SECURITY
 */
export const STRICT_TRANSPORT_SECURITY = new HTTPHeader('Strict-Transport-Security');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.UGPRADE_INSECURE_REQUESTS
 */
export const UGPRADE_INSECURE_REQUESTS = new HTTPHeader('Upgrade-Insecure-Requests');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_CONTENT_TYPE_OPTIONS
 */
export const X_CONTENT_TYPE_OPTIONS = new HTTPHeader('X-Content-Type-Options');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_DOWNLOAD_OPTIONS
 */
export const X_DOWNLOAD_OPTIONS = new HTTPHeader('X-Download-Options');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_FRAME_OPTIONS
 */
export const X_FRAME_OPTIONS = new HTTPHeader('X-Frame-Options');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_PERMITTED_CROSS_DOMAIN_POLICIES
 */
export const X_PERMITTED_CROSS_DOMAIN_POLICIES = new HTTPHeader('X-Permitted-Cross-Domain-Policies');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_POWERED_BY
 */
export const X_POWERED_BY = new HTTPHeader('X-Powered-By');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_XSS_PROTECTION
 */
export const X_XSS_PROTECTION = new HTTPHeader('X-XSS-Protection');

/**
 * HTTP Public Key Pinning (HPKP)
 */

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.PUBLIC_KEY_PINS
 */
export const PUBLIC_KEY_PINS = new HTTPHeader('Public-Key-Pins');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.PUBLIC_KEY_PINS_REPORT_ONLY
 */
export const PUBLIC_KEY_PINS_REPORT_ONLY = new HTTPHeader('Public-Key-Pins-Report-Only');

/**
 * Fetch metadata request headers
 */

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_FETCH_SITE
 */
export const SEC_FETCH_SITE = new HTTPHeader('Sec-Fetch-Site');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_FETCH_MODE
 */
export const SEC_FETCH_MODE = new HTTPHeader('Sec-Fetch-Mode');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_FETCH_USER
 */
export const SEC_FETCH_USER = new HTTPHeader('Sec-Fetch-User');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_FETCH_DEST
 */
export const SEC_FETCH_DEST = new HTTPHeader('Sec-Fetch-Dest');

/**
 * Server-sent requests
 */

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.LAST_EVENT_ID
 */
export const LAST_EVENT_ID = new HTTPHeader('Last-Event-Id');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.NEL
 */
export const NEL = new HTTPHeader('NEL');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.PING_FROM
 */
export const PING_FROM = new HTTPHeader('Ping-From');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.PING_TO
 */
export const PING_TO = new HTTPHeader('Ping-To');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.REPORT_TO
 */
export const REPORT_TO = new HTTPHeader('Report-To');

/**
 * Transfer coding
 */

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.TRANSFER_ENCODING
 */
export const TRANSFER_ENCODING = new HTTPHeader('Transfer-Encoding');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.TE
 */
export const TE = new HTTPHeader('TE');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.TRAILER
 */
export const TRAILER = new HTTPHeader('Trailer');

/**
 * Websockets
 */

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_WEBSOCKET_KEY
 */
export const SEC_WEBSOCKET_KEY = new HTTPHeader('Sec-WebSocket-Key');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_WEBSOCKET_EXTENSIONS
 */
export const SEC_WEBSOCKET_EXTENSIONS = new HTTPHeader('Sec-WebSocket-Extensions');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_WEBSOCKET_ACCEPT
 */
export const SEC_WEBSOCKET_ACCEPT = new HTTPHeader('Sec-WebSocket-Accept');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_WEBSOCKET_PROTOCOL
 */
export const SEC_WEBSOCKET_PROTOCOL = new HTTPHeader('Sec-WebSocket-Protocol');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SEC_WEBSOCKET_VERSION
 */
export const SEC_WEBSOCKET_VERSION = new HTTPHeader('Sec-WebSocket-Version');

/**
 * Other
 */

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCEPT_PUSH_POLICY
 */
export const ACCEPT_PUSH_POLICY = new HTTPHeader('Accept-Push-Policy');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ACCEPT_SIGNATURE
 */
export const ACCEPT_SIGNATURE = new HTTPHeader('Accept-Signature');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.ALT_SVC
 */
export const ALT_SVC = new HTTPHeader('Alt-Svc');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.DATE
 */
export const DATE = new HTTPHeader('Date');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.LARGE_ALLOCATION
 */
export const LARGE_ALLOCATION = new HTTPHeader('Large-Allocation');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.LINK
 */
export const LINK = new HTTPHeader('Link');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.PUSH_POLICY
 */
export const PUSH_POLICY = new HTTPHeader('Push-Policy');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.RETRY_AFTER
 */
export const RETRY_AFTER = new HTTPHeader('Retry-After');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SIGNATURE
 */
export const SIGNATURE = new HTTPHeader('Signature');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SIGNED_HEADERS
 */
export const SIGNED_HEADERS = new HTTPHeader('Signed-Headers');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SERVER_TIMING
 */
export const SERVER_TIMING = new HTTPHeader('Server-Timing');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SERVICE_WORKER_ALLOWED
 */
export const SERVICE_WORKER_ALLOWED = new HTTPHeader('Service-Worker-Allowed');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.SOURCEMAP
 */
export const SOURCEMAP = new HTTPHeader('SourceMap');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.UPGRADE
 */
export const UPGRADE = new HTTPHeader('Upgrade');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_DNS_PREFETCH_CONTROL
 */
export const X_DNS_PREFETCH_CONTROL = new HTTPHeader('X-DNS-Prefetch-Control');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_PINGBACK
 */
export const X_PINGBACK = new HTTPHeader('X-Pingback');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_REQUESTED_WITH
 */
export const X_REQUESTED_WITH = new HTTPHeader('X-Requested-With');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_ROBOTS_TAG
 */
export const X_ROBOTS_TAG = new HTTPHeader('X-Robots-Tag');

/**
 * @constant {module:http.HTTPHeader} module:http.HTTPHeaders.X_UA_COMPATIBLE
 */
export const X_UA_COMPATIBLE = new HTTPHeader('X-UA-Compatible');

/**
 * BlueJS Custom Headers
 */
export const X_CSRF_TOKEN = new HTTPHeader('X-CSRF-Token');
export const X_CHANNEL_ID = new HTTPHeader('X-Channel-ID');
export const X_REQUEST_ID = new HTTPHeader('X-Request-ID');
