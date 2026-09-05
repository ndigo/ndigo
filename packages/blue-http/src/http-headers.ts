import { HTTPHeader } from './http-header';

/**
 * @namespace module:http.HTTPHeaders
 */

/**
 * Authentication
 */

/**
 * @readonly The constant value documented by the code.
 */
export const WWW_AUTHENTICATE = new HTTPHeader('WWW-Authenticate');

/**
 * @readonly The constant value documented by the code.
 */
export const AUTHORIZATION = new HTTPHeader('Authorization');

/**
 * @readonly The constant value documented by the code.
 */
export const PROXY_AUTHENTICATE = new HTTPHeader('Proxy-Authenticate');

/**
 * @readonly The constant value documented by the code.
 */
export const PROXY_AUTHORIZATION = new HTTPHeader('Proxy-Authorization');

/**
 * Caching
 */

/**
 * @readonly The constant value documented by the code.
 */
export const AGE = new HTTPHeader('Age');

/**
 * @readonly The constant value documented by the code.
 */
export const CACHE_CONTROL = new HTTPHeader('Cache-Control');

/**
 * @readonly The constant value documented by the code.
 */
export const CLEAR_SITE_DATA = new HTTPHeader('Clear-Site-Data');

/**
 * @readonly The constant value documented by the code.
 */
export const EXPIRES = new HTTPHeader('Expires');

/**
 * @readonly The constant value documented by the code.
 */
export const PRAGMA = new HTTPHeader('Pragma');

/**
 * @readonly The constant value documented by the code.
 */
export const WARNING = new HTTPHeader('Warning');

/**
 * Client Hints
 */

/**
 * @readonly The constant value documented by the code.
 */
export const ACCEPT_CH = new HTTPHeader('Accept-CH');

/**
 * @readonly The constant value documented by the code.
 */
export const ACCEPT_CH_LIFETIME = new HTTPHeader('Accept-CH-Lifetime');

/**
 * @readonly The constant value documented by the code.
 */
export const EARLY_DATA = new HTTPHeader('Early-Data');

/**
 * @readonly The constant value documented by the code.
 */
export const DEVICE_MEMORY = new HTTPHeader('Device-Memory');

/**
 * @readonly The constant value documented by the code.
 */
export const SAVE_DATA = new HTTPHeader('Save-Data');

/**
 * @readonly The constant value documented by the code.
 */
export const VIEWPORT_WIDTH = new HTTPHeader('Viewport-Width');

/**
 * @readonly The constant value documented by the code.
 */
export const WIDTH = new HTTPHeader('Width');

/**
 * Conditionals
 */

/**
 * @readonly The constant value documented by the code.
 */
export const LAST_MODIFIED = new HTTPHeader('Last-Modified');

/**
 * @readonly The constant value documented by the code.
 */
export const ETAG = new HTTPHeader('ETag');

/**
 * @readonly The constant value documented by the code.
 */
export const IF_MATCH = new HTTPHeader('If-Match');

/**
 * @readonly The constant value documented by the code.
 */
export const IF_NONE_MATCH = new HTTPHeader('If-None-Match');

/**
 * @readonly The constant value documented by the code.
 */
export const IF_MODIFIED_SINCE = new HTTPHeader('If-Modified-Since');

/**
 * @readonly The constant value documented by the code.
 */
export const IF_UNMODIFIED_SINCE = new HTTPHeader('If-Unmodified-Since');

/**
 * @readonly The constant value documented by the code.
 */
export const VARY = new HTTPHeader('Vary');

/**
 * Content management
 */

/**
 * @readonly The constant value documented by the code.
 */
export const CONNECTION = new HTTPHeader('Connection');

/**
 * @readonly The constant value documented by the code.
 */
export const KEEP_ALIVE = new HTTPHeader('Keep-Alive');

/**
 * Content negotiation
 */

/**
 * @readonly The constant value documented by the code.
 */
export const ACCEPT = new HTTPHeader('Accept');

/**
 * @readonly The constant value documented by the code.
 */
export const ACCEPT_CHARSET = new HTTPHeader('Accept-Charset');

/**
 * @readonly The constant value documented by the code.
 */
export const ACCEPT_ENCODING = new HTTPHeader('Accept-Encoding');

/**
 * Controls
 */

/**
 * @readonly The constant value documented by the code.
 */
export const EXPECT = new HTTPHeader('Expect');

/**
 * @readonly The constant value documented by the code.
 */
export const MAX_FORWARDS = new HTTPHeader('Max-Forwards');

/**
 * Cookies
 */

/**
 * @readonly The constant value documented by the code.
 */
export const COOKIE = new HTTPHeader('Cookie');

/**
 * @readonly The constant value documented by the code.
 */
export const SET_COOKIE = new HTTPHeader('Set-Cookie');

/**
 * @readonly The constant value documented by the code.
 */
export const COOKIE2 = new HTTPHeader('Cookie2');

/**
 * @readonly The constant value documented by the code.
 */
export const SET_COOKIE2 = new HTTPHeader('Set-Cookie2');

/**
 * CORS
 */

/**
 * @readonly The constant value documented by the code.
 */
export const ACCESS_CONTROL_ALLOW_ORIGIN = new HTTPHeader('Access-Control-Allow-Origin');

/**
 * @readonly The constant value documented by the code.
 */
export const ACCESS_CONTROL_ALLOW_CREDENTIALS = new HTTPHeader('Access-Control-Allow-Credentials');

/**
 * @readonly The constant value documented by the code.
 */
export const ACCESS_CONTROL_ALLOW_HEADERS = new HTTPHeader('Access-Control-Allow-Headers');

/**
 * @readonly The constant value documented by the code.
 */
export const ACCESS_CONTROL_ALLOW_METHODS = new HTTPHeader('Access-Control-Allow-Methods');

/**
 * @readonly The constant value documented by the code.
 */
export const ACCESS_CONTROL_EXPOSE_HEADERS = new HTTPHeader('Access-Control-Expose-Headers');

/**
 * @readonly The constant value documented by the code.
 */
export const ACCESS_CONTROL_MAX_AGE = new HTTPHeader('Access-Control-Max-Age');

/**
 * @readonly The constant value documented by the code.
 */
export const ACCESS_CONTROL_REQUEST_HEADERS = new HTTPHeader('Access-Control-Request-Headers');

/**
 * @readonly The constant value documented by the code.
 */
export const ACCESS_CONTROL_REQUEST_METHOD = new HTTPHeader('Access-Control-Request-Method');

/**
 * @readonly The constant value documented by the code.
 */
export const ORIGIN = new HTTPHeader('Origin');

/**
 * @readonly The constant value documented by the code.
 */
export const TIMING_ALLOW_ORIGIN = new HTTPHeader('Timing-Allow-Origin');

/**
 * Do Not Track
 */

/**
 * @readonly The constant value documented by the code.
 */
export const DNT = new HTTPHeader('DNT');

/**
 * @readonly The constant value documented by the code.
 */
export const TK = new HTTPHeader('Tk');

/**
 * Downloads
 */

/**
 * @readonly The constant value documented by the code.
 */
export const CONTENT_DISPOSITION = new HTTPHeader('Content-Disposition');

/**
 * Message body information
 */

/**
 * @readonly The constant value documented by the code.
 */
export const CONTENT_LENGTH = new HTTPHeader('Content-Length');

/**
 * @readonly The constant value documented by the code.
 */
export const CONTENT_TYPE = new HTTPHeader('Content-Type');

/**
 * @readonly The constant value documented by the code.
 */
export const CONTENT_ENCODING = new HTTPHeader('Content-Encoding');

/**
 * @readonly The constant value documented by the code.
 */
export const CONTENT_LANGUAGE = new HTTPHeader('Content-Language');

/**
 * @readonly The constant value documented by the code.
 */
export const CONTENT_LOCATION = new HTTPHeader('Content-Location');

/**
 * Proxies
 */

/**
 * @readonly The constant value documented by the code.
 */
export const FORWARDED = new HTTPHeader('Forwarded');

/**
 * @readonly The constant value documented by the code.
 */
export const X_FORWARDED_FOR = new HTTPHeader('X-Forwarded-For');

/**
 * @readonly The constant value documented by the code.
 */
export const X_FORWARDED_HOST = new HTTPHeader('X-Forwarded-Host');

/**
 * @readonly The constant value documented by the code.
 */
export const X_FORWARDED_PROTO = new HTTPHeader('X-Forwarded-Proto');

/**
 * @readonly The constant value documented by the code.
 */
export const VIA = new HTTPHeader('Via');

/**
 * Redirects
 */

/**
 * @readonly The constant value documented by the code.
 */
export const LOCATION = new HTTPHeader('Location');

/**
 * Request context
 */

/**
 * @readonly The constant value documented by the code.
 */
export const FROM = new HTTPHeader('From');

/**
 * @readonly The constant value documented by the code.
 */
export const HOST = new HTTPHeader('Host');

/**
 * @readonly The constant value documented by the code.
 */
export const REFERER = new HTTPHeader('Referer');

/**
 * @readonly The constant value documented by the code.
 */
export const REFERER_POLICY = new HTTPHeader('Referer-Policy');

/**
 * @readonly The constant value documented by the code.
 */
export const USER_AGENT = new HTTPHeader('User-Agent');

/**
 * Response context
 */

/**
 * @readonly The constant value documented by the code.
 */
export const ALLOW = new HTTPHeader('Allow');

/**
 * @readonly The constant value documented by the code.
 */
export const SERVER = new HTTPHeader('Server');

/**
 * Range requests
 */

/**
 * @readonly The constant value documented by the code.
 */
export const ACCEPT_RANGES = new HTTPHeader('Accept-Ranges');

/**
 * @readonly The constant value documented by the code.
 */
export const RANGE = new HTTPHeader('Range');

/**
 * @readonly The constant value documented by the code.
 */
export const IF_RANGE = new HTTPHeader('If-Range');

/**
 * @readonly The constant value documented by the code.
 */
export const CONTENT_RANGE = new HTTPHeader('Content-Range');

/**
 * Security
 */

/**
 * @readonly The constant value documented by the code.
 */
export const CROSS_ORIGIN_EMBEDDER_POLICY = new HTTPHeader('Cross-Origin-Embedder-Policy');

/**
 * @readonly The constant value documented by the code.
 */
export const CROSS_ORIGIN_OPENER_POLICY = new HTTPHeader('Cross-Origin-Opener-Policy');

/**
 * @readonly The constant value documented by the code.
 */
export const CROSS_ORIGIN_RESOURCE_POLICY = new HTTPHeader('Cross-Origin-Resource-Policy');

/**
 * @readonly The constant value documented by the code.
 */
export const CONTENT_SECURITY_POLICY = new HTTPHeader('Content-Security-Policy');

/**
 * @readonly The constant value documented by the code.
 */
export const CONTENT_SECURITY_POLICY_REPORT_ONLY = new HTTPHeader('Content-Security-Policy-Report-Only');

/**
 * @readonly The constant value documented by the code.
 */
export const EXPECT_CT = new HTTPHeader('Expect-CT');

/**
 * @readonly The constant value documented by the code.
 */
export const FEATURE_POLICY = new HTTPHeader('Feature-Policy');

/**
 * @readonly The constant value documented by the code.
 */
export const ORIGIN_ISOLATION = new HTTPHeader('Origin-Isolation');

/**
 * @readonly The constant value documented by the code.
 */
export const STRICT_TRANSPORT_SECURITY = new HTTPHeader('Strict-Transport-Security');

/**
 * @readonly The constant value documented by the code.
 */
export const UGPRADE_INSECURE_REQUESTS = new HTTPHeader('Upgrade-Insecure-Requests');

/**
 * @readonly The constant value documented by the code.
 */
export const X_CONTENT_TYPE_OPTIONS = new HTTPHeader('X-Content-Type-Options');

/**
 * @readonly The constant value documented by the code.
 */
export const X_DOWNLOAD_OPTIONS = new HTTPHeader('X-Download-Options');

/**
 * @readonly The constant value documented by the code.
 */
export const X_FRAME_OPTIONS = new HTTPHeader('X-Frame-Options');

/**
 * @readonly The constant value documented by the code.
 */
export const X_PERMITTED_CROSS_DOMAIN_POLICIES = new HTTPHeader('X-Permitted-Cross-Domain-Policies');

/**
 * @readonly The constant value documented by the code.
 */
export const X_POWERED_BY = new HTTPHeader('X-Powered-By');

/**
 * @readonly The constant value documented by the code.
 */
export const X_XSS_PROTECTION = new HTTPHeader('X-XSS-Protection');

/**
 * HTTP Public Key Pinning (HPKP)
 */

/**
 * @readonly The constant value documented by the code.
 */
export const PUBLIC_KEY_PINS = new HTTPHeader('Public-Key-Pins');

/**
 * @readonly The constant value documented by the code.
 */
export const PUBLIC_KEY_PINS_REPORT_ONLY = new HTTPHeader('Public-Key-Pins-Report-Only');

/**
 * Fetch metadata request headers
 */

/**
 * @readonly The constant value documented by the code.
 */
export const SEC_FETCH_SITE = new HTTPHeader('Sec-Fetch-Site');

/**
 * @readonly The constant value documented by the code.
 */
export const SEC_FETCH_MODE = new HTTPHeader('Sec-Fetch-Mode');

/**
 * @readonly The constant value documented by the code.
 */
export const SEC_FETCH_USER = new HTTPHeader('Sec-Fetch-User');

/**
 * @readonly The constant value documented by the code.
 */
export const SEC_FETCH_DEST = new HTTPHeader('Sec-Fetch-Dest');

/**
 * Server-sent requests
 */

/**
 * @readonly The constant value documented by the code.
 */
export const LAST_EVENT_ID = new HTTPHeader('Last-Event-Id');

/**
 * @readonly The constant value documented by the code.
 */
export const NEL = new HTTPHeader('NEL');

/**
 * @readonly The constant value documented by the code.
 */
export const PING_FROM = new HTTPHeader('Ping-From');

/**
 * @readonly The constant value documented by the code.
 */
export const PING_TO = new HTTPHeader('Ping-To');

/**
 * @readonly The constant value documented by the code.
 */
export const REPORT_TO = new HTTPHeader('Report-To');

/**
 * Transfer coding
 */

/**
 * @readonly The constant value documented by the code.
 */
export const TRANSFER_ENCODING = new HTTPHeader('Transfer-Encoding');

/**
 * @readonly The constant value documented by the code.
 */
export const TE = new HTTPHeader('TE');

/**
 * @readonly The constant value documented by the code.
 */
export const TRAILER = new HTTPHeader('Trailer');

/**
 * Websockets
 */

/**
 * @readonly The constant value documented by the code.
 */
export const SEC_WEBSOCKET_KEY = new HTTPHeader('Sec-WebSocket-Key');

/**
 * @readonly The constant value documented by the code.
 */
export const SEC_WEBSOCKET_EXTENSIONS = new HTTPHeader('Sec-WebSocket-Extensions');

/**
 * @readonly The constant value documented by the code.
 */
export const SEC_WEBSOCKET_ACCEPT = new HTTPHeader('Sec-WebSocket-Accept');

/**
 * @readonly The constant value documented by the code.
 */
export const SEC_WEBSOCKET_PROTOCOL = new HTTPHeader('Sec-WebSocket-Protocol');

/**
 * @readonly The constant value documented by the code.
 */
export const SEC_WEBSOCKET_VERSION = new HTTPHeader('Sec-WebSocket-Version');

/**
 * Other
 */

/**
 * @readonly The constant value documented by the code.
 */
export const ACCEPT_PUSH_POLICY = new HTTPHeader('Accept-Push-Policy');

/**
 * @readonly The constant value documented by the code.
 */
export const ACCEPT_SIGNATURE = new HTTPHeader('Accept-Signature');

/**
 * @readonly The constant value documented by the code.
 */
export const ALT_SVC = new HTTPHeader('Alt-Svc');

/**
 * @readonly The constant value documented by the code.
 */
export const DATE = new HTTPHeader('Date');

/**
 * @readonly The constant value documented by the code.
 */
export const LARGE_ALLOCATION = new HTTPHeader('Large-Allocation');

/**
 * @readonly The constant value documented by the code.
 */
export const LINK = new HTTPHeader('Link');

/**
 * @readonly The constant value documented by the code.
 */
export const PUSH_POLICY = new HTTPHeader('Push-Policy');

/**
 * @readonly The constant value documented by the code.
 */
export const RETRY_AFTER = new HTTPHeader('Retry-After');

/**
 * @readonly The constant value documented by the code.
 */
export const SIGNATURE = new HTTPHeader('Signature');

/**
 * @readonly The constant value documented by the code.
 */
export const SIGNED_HEADERS = new HTTPHeader('Signed-Headers');

/**
 * @readonly The constant value documented by the code.
 */
export const SERVER_TIMING = new HTTPHeader('Server-Timing');

/**
 * @readonly The constant value documented by the code.
 */
export const SERVICE_WORKER_ALLOWED = new HTTPHeader('Service-Worker-Allowed');

/**
 * @readonly The constant value documented by the code.
 */
export const SOURCEMAP = new HTTPHeader('SourceMap');

/**
 * @readonly The constant value documented by the code.
 */
export const UPGRADE = new HTTPHeader('Upgrade');

/**
 * @readonly The constant value documented by the code.
 */
export const X_DNS_PREFETCH_CONTROL = new HTTPHeader('X-DNS-Prefetch-Control');

/**
 * @readonly The constant value documented by the code.
 */
export const X_PINGBACK = new HTTPHeader('X-Pingback');

/**
 * @readonly The constant value documented by the code.
 */
export const X_REQUESTED_WITH = new HTTPHeader('X-Requested-With');

/**
 * @readonly The constant value documented by the code.
 */
export const X_ROBOTS_TAG = new HTTPHeader('X-Robots-Tag');

/**
 * @readonly The constant value documented by the code.
 */
export const X_UA_COMPATIBLE = new HTTPHeader('X-UA-Compatible');

/**
 * BlueJS Custom Headers
 */
export const X_CSRF_TOKEN = new HTTPHeader('X-CSRF-Token');
export const X_CHANNEL_ID = new HTTPHeader('X-Channel-ID');
export const X_REQUEST_ID = new HTTPHeader('X-Request-ID');
