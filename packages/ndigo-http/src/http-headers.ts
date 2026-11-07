/**
 * Standard HTTP header constants.
 */
import { HTTPHeader } from './http-header';
import { AuthorizationHeader } from './authorization-header';
import { ContentTypeHeader } from './content-type-header';
import { SetCookieHeader } from './set-cookie-header';

// Authentication

export const WWW_AUTHENTICATE = new HTTPHeader('WWW-Authenticate');

export const AUTHORIZATION = new AuthorizationHeader('Authorization');

export const PROXY_AUTHENTICATE = new HTTPHeader('Proxy-Authenticate');

export const PROXY_AUTHORIZATION = new HTTPHeader('Proxy-Authorization');

// Caching

export const AGE = new HTTPHeader('Age');

export const CACHE_CONTROL = new HTTPHeader('Cache-Control');

export const CLEAR_SITE_DATA = new HTTPHeader('Clear-Site-Data');

export const EXPIRES = new HTTPHeader('Expires');

export const PRAGMA = new HTTPHeader('Pragma');

export const WARNING = new HTTPHeader('Warning');

// Client Hints

export const ACCEPT_CH = new HTTPHeader('Accept-CH');

export const ACCEPT_CH_LIFETIME = new HTTPHeader('Accept-CH-Lifetime');

export const EARLY_DATA = new HTTPHeader('Early-Data');

export const DEVICE_MEMORY = new HTTPHeader('Device-Memory');

export const SAVE_DATA = new HTTPHeader('Save-Data');

export const VIEWPORT_WIDTH = new HTTPHeader('Viewport-Width');

export const WIDTH = new HTTPHeader('Width');

// Conditionals

export const LAST_MODIFIED = new HTTPHeader('Last-Modified');

export const ETAG = new HTTPHeader('ETag');

export const IF_MATCH = new HTTPHeader('If-Match');

export const IF_NONE_MATCH = new HTTPHeader('If-None-Match');

export const IF_MODIFIED_SINCE = new HTTPHeader('If-Modified-Since');

export const IF_UNMODIFIED_SINCE = new HTTPHeader('If-Unmodified-Since');

export const VARY = new HTTPHeader('Vary');

// Content management

export const CONNECTION = new HTTPHeader('Connection');

export const KEEP_ALIVE = new HTTPHeader('Keep-Alive');

// Content negotiation

export const ACCEPT = new HTTPHeader('Accept');

export const ACCEPT_CHARSET = new HTTPHeader('Accept-Charset');

export const ACCEPT_ENCODING = new HTTPHeader('Accept-Encoding');

export const ACCEPT_LANGUAGE = new HTTPHeader('Accept-Language');

// Controls

export const EXPECT = new HTTPHeader('Expect');

export const MAX_FORWARDS = new HTTPHeader('Max-Forwards');

// Cookies

export const COOKIE = new HTTPHeader('Cookie');

export const SET_COOKIE = new SetCookieHeader('Set-Cookie');

export const COOKIE2 = new HTTPHeader('Cookie2');

export const SET_COOKIE2 = new HTTPHeader('Set-Cookie2');

// CORS

export const ACCESS_CONTROL_ALLOW_ORIGIN = new HTTPHeader('Access-Control-Allow-Origin');

export const ACCESS_CONTROL_ALLOW_CREDENTIALS = new HTTPHeader('Access-Control-Allow-Credentials');

export const ACCESS_CONTROL_ALLOW_HEADERS = new HTTPHeader('Access-Control-Allow-Headers');

export const ACCESS_CONTROL_ALLOW_METHODS = new HTTPHeader('Access-Control-Allow-Methods');

export const ACCESS_CONTROL_EXPOSE_HEADERS = new HTTPHeader('Access-Control-Expose-Headers');

export const ACCESS_CONTROL_MAX_AGE = new HTTPHeader('Access-Control-Max-Age');

export const ACCESS_CONTROL_REQUEST_HEADERS = new HTTPHeader('Access-Control-Request-Headers');

export const ACCESS_CONTROL_REQUEST_METHOD = new HTTPHeader('Access-Control-Request-Method');

export const ORIGIN = new HTTPHeader('Origin');

export const TIMING_ALLOW_ORIGIN = new HTTPHeader('Timing-Allow-Origin');

// Do Not Track

export const DNT = new HTTPHeader('DNT');

export const TK = new HTTPHeader('Tk');

// Downloads

export const CONTENT_DISPOSITION = new HTTPHeader('Content-Disposition');

// Message body information

export const CONTENT_LENGTH = new HTTPHeader('Content-Length');

export const CONTENT_TYPE = new ContentTypeHeader('Content-Type');

export const CONTENT_ENCODING = new HTTPHeader('Content-Encoding');

export const CONTENT_LANGUAGE = new HTTPHeader('Content-Language');

export const CONTENT_LOCATION = new HTTPHeader('Content-Location');

// Proxies

export const FORWARDED = new HTTPHeader('Forwarded');

export const X_FORWARDED_FOR = new HTTPHeader('X-Forwarded-For');

export const X_FORWARDED_HOST = new HTTPHeader('X-Forwarded-Host');

export const X_FORWARDED_PROTO = new HTTPHeader('X-Forwarded-Proto');

export const VIA = new HTTPHeader('Via');

// Redirects

export const LOCATION = new HTTPHeader('Location');

// Request context

export const FROM = new HTTPHeader('From');

export const HOST = new HTTPHeader('Host');

export const REFERER = new HTTPHeader('Referer');

export const REFERER_POLICY = new HTTPHeader('Referer-Policy');

export const USER_AGENT = new HTTPHeader('User-Agent');

// Response context

export const ALLOW = new HTTPHeader('Allow');

export const SERVER = new HTTPHeader('Server');

// Range requests

export const ACCEPT_RANGES = new HTTPHeader('Accept-Ranges');

export const RANGE = new HTTPHeader('Range');

export const IF_RANGE = new HTTPHeader('If-Range');

export const CONTENT_RANGE = new HTTPHeader('Content-Range');

// Security

export const CROSS_ORIGIN_EMBEDDER_POLICY = new HTTPHeader('Cross-Origin-Embedder-Policy');

export const CROSS_ORIGIN_OPENER_POLICY = new HTTPHeader('Cross-Origin-Opener-Policy');

export const CROSS_ORIGIN_RESOURCE_POLICY = new HTTPHeader('Cross-Origin-Resource-Policy');

export const CONTENT_SECURITY_POLICY = new HTTPHeader('Content-Security-Policy');

export const CONTENT_SECURITY_POLICY_REPORT_ONLY = new HTTPHeader('Content-Security-Policy-Report-Only');

export const EXPECT_CT = new HTTPHeader('Expect-CT');

export const FEATURE_POLICY = new HTTPHeader('Feature-Policy');

export const ORIGIN_ISOLATION = new HTTPHeader('Origin-Isolation');

export const STRICT_TRANSPORT_SECURITY = new HTTPHeader('Strict-Transport-Security');

export const UGPRADE_INSECURE_REQUESTS = new HTTPHeader('Upgrade-Insecure-Requests');

export const X_CONTENT_TYPE_OPTIONS = new HTTPHeader('X-Content-Type-Options');

export const X_DOWNLOAD_OPTIONS = new HTTPHeader('X-Download-Options');

export const X_FRAME_OPTIONS = new HTTPHeader('X-Frame-Options');

export const X_PERMITTED_CROSS_DOMAIN_POLICIES = new HTTPHeader('X-Permitted-Cross-Domain-Policies');

export const X_POWERED_BY = new HTTPHeader('X-Powered-By');

export const X_XSS_PROTECTION = new HTTPHeader('X-XSS-Protection');

// HTTP Public Key Pinning (HPKP)

export const PUBLIC_KEY_PINS = new HTTPHeader('Public-Key-Pins');

export const PUBLIC_KEY_PINS_REPORT_ONLY = new HTTPHeader('Public-Key-Pins-Report-Only');

// Fetch metadata request headers

export const SEC_FETCH_SITE = new HTTPHeader('Sec-Fetch-Site');

export const SEC_FETCH_MODE = new HTTPHeader('Sec-Fetch-Mode');

export const SEC_FETCH_USER = new HTTPHeader('Sec-Fetch-User');

export const SEC_FETCH_DEST = new HTTPHeader('Sec-Fetch-Dest');

// Server-sent requests

export const LAST_EVENT_ID = new HTTPHeader('Last-Event-Id');

export const NEL = new HTTPHeader('NEL');

export const PING_FROM = new HTTPHeader('Ping-From');

export const PING_TO = new HTTPHeader('Ping-To');

export const REPORT_TO = new HTTPHeader('Report-To');

// Transfer coding

export const TRANSFER_ENCODING = new HTTPHeader('Transfer-Encoding');

export const TE = new HTTPHeader('TE');

export const TRAILER = new HTTPHeader('Trailer');

// Websockets

export const SEC_WEBSOCKET_KEY = new HTTPHeader('Sec-WebSocket-Key');

export const SEC_WEBSOCKET_EXTENSIONS = new HTTPHeader('Sec-WebSocket-Extensions');

export const SEC_WEBSOCKET_ACCEPT = new HTTPHeader('Sec-WebSocket-Accept');

export const SEC_WEBSOCKET_PROTOCOL = new HTTPHeader('Sec-WebSocket-Protocol');

export const SEC_WEBSOCKET_VERSION = new HTTPHeader('Sec-WebSocket-Version');

// Other

export const ACCEPT_PUSH_POLICY = new HTTPHeader('Accept-Push-Policy');

export const ACCEPT_SIGNATURE = new HTTPHeader('Accept-Signature');

export const ALT_SVC = new HTTPHeader('Alt-Svc');

export const DATE = new HTTPHeader('Date');

export const LARGE_ALLOCATION = new HTTPHeader('Large-Allocation');

export const LINK = new HTTPHeader('Link');

export const PUSH_POLICY = new HTTPHeader('Push-Policy');

export const RETRY_AFTER = new HTTPHeader('Retry-After');

export const SIGNATURE = new HTTPHeader('Signature');

export const SIGNED_HEADERS = new HTTPHeader('Signed-Headers');

export const SERVER_TIMING = new HTTPHeader('Server-Timing');

export const SERVICE_WORKER_ALLOWED = new HTTPHeader('Service-Worker-Allowed');

export const SOURCEMAP = new HTTPHeader('SourceMap');

export const UPGRADE = new HTTPHeader('Upgrade');

export const X_DNS_PREFETCH_CONTROL = new HTTPHeader('X-DNS-Prefetch-Control');

export const X_PINGBACK = new HTTPHeader('X-Pingback');

export const X_REQUESTED_WITH = new HTTPHeader('X-Requested-With');

export const X_ROBOTS_TAG = new HTTPHeader('X-Robots-Tag');

export const X_UA_COMPATIBLE = new HTTPHeader('X-UA-Compatible');

// Ndigo Custom Headers
export const X_CSRF_TOKEN = new HTTPHeader('X-CSRF-Token');
export const X_CHANNEL_ID = new HTTPHeader('X-Channel-ID');
export const X_REQUEST_ID = new HTTPHeader('X-Request-ID');
