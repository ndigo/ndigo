/**
 * The playground's browser client: the interactive half of the auth matrix.
 *
 * Everything it does is same-origin `fetch` (the built page is served by the
 * playground itself; the `vite dev` server proxies the API paths), which is the
 * point — the cookie modes work through the browser's own cookie jar, so
 * `HttpOnly` really means "this script cannot read it". Where the client needs
 * the credential itself (the socket demo, which cannot set headers and cannot
 * read an `HttpOnly` cookie), it uses the session id or access token the server
 * returned in a body.
 *
 * Tokens live in memory only: nothing here persists a JWT to storage, and
 * nothing re-implements what the server already owns.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */

/** Tokens held for this page only (the refresh flow needs both). */
const tokens: { access: string | null; refresh: string | null } = { access: null, refresh: null };

/**
 * The last session id a login body returned. The cookie itself is `HttpOnly`,
 * so this is the only way a script ever sees it — which is exactly the property
 * mode 1 demonstrates.
 */
let sessionId: string | null = null;

/** A dispatched call's outcome, reduced to what the panel shows. */
interface CallResult {
    readonly status: number;
    readonly ok: boolean;
    readonly body: Record<string, unknown> | null;
    readonly retryAfter: string | null;
}

/**
 * Narrows a parsed JSON body to a string-keyed record — a type guard, so every
 * field read afterwards is still `unknown` until it is `typeof`-checked.
 *
 * @param value - The parsed body.
 * @returns The record, or `null` when the body was not an object.
 */
function asRecord(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

/**
 * Performs a JSON call against the playground.
 *
 * @param path - The request path.
 * @param init - Optional fetch overrides.
 * @returns The status, the parsed body and the `Retry-After` header.
 */
async function call(path: string, init: RequestInit = {}): Promise<CallResult> {
    const headers = new Headers(init.headers);
    headers.set('accept', 'application/json');
    const response = await fetch(path, {
        credentials: 'same-origin',
        ...init,
        headers,
    });
    const text = await response.text();
    let body: Record<string, unknown> | null = null;
    try {
        body = asRecord(text === '' ? null : JSON.parse(text));
    } catch {
        // A non-JSON body (the EJS shell) is reported as no body.
    }
    return { status: response.status, ok: response.ok, body, retryAfter: response.headers.get('retry-after') };
}

/** Appends one line to the transcript. */
function append(line: string, kind: 'ok' | 'bad' | 'note' = 'ok'): void {
    const log = document.getElementById('log');
    if (log === null) return;
    const entry = document.createElement('div');
    const marker = kind === 'note' ? '# ' : kind === 'bad' ? '✗ ' : '✓ ';
    entry.textContent = `${marker}${new Date().toLocaleTimeString()} ${line}`;
    entry.style.color = kind === 'bad' ? '#b3261e' : kind === 'note' ? '#666' : '#1f7a5a';
    log.append(entry);
    log.scrollTop = log.scrollHeight;
}

/** Renders a call outcome into the transcript. */
function report(label: string, result: CallResult): void {
    const retry = result.retryAfter === null ? '' : ` (Retry-After: ${String(result.retryAfter)}s)`;
    append(`${label} → ${result.status}${retry} ${JSON.stringify(result.body)}`, result.ok ? 'ok' : 'bad');
}

/** Reads the `code` extension member of a problem document, or `null`. */
function codeOf(body: Record<string, unknown> | null): string | null {
    const code = body?.['code'];
    return typeof code === 'string' ? code : null;
}

/** The credentials currently typed into the panel. */
function credentials(): { username: string; password: string } {
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const usernameValue = username instanceof HTMLInputElement ? username.value : '';
    const passwordValue = password instanceof HTMLInputElement ? password.value : '';
    return { username: usernameValue === '' ? 'admin' : usernameValue, password: passwordValue };
}

/** Builds a button bound to a handler. */
function button(label: string, handler: () => void): HTMLButtonElement {
    const element = document.createElement('button');
    element.type = 'button';
    element.textContent = label;
    element.addEventListener('click', handler);
    return element;
}

/** Wraps nodes in a labelled group (a `<fieldset><legend>`), one per mode. */
function group(legend: string, ...nodes: Node[]): HTMLFieldSetElement {
    const fieldset = document.createElement('fieldset');
    const caption = document.createElement('legend');
    caption.textContent = legend;
    const row = document.createElement('div');
    row.className = 'row';
    row.append(...nodes);
    fieldset.append(caption, row);
    return fieldset;
}

/** Builds one labelled text input. */
function field(id: string, labelText: string, value: string, type = 'text'): HTMLDivElement {
    const wrapper = document.createElement('div');
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = labelText;
    const input = document.createElement('input');
    input.id = id;
    input.type = type;
    input.value = value;
    wrapper.append(label, input);
    return wrapper;
}

/** POST /auth/login — mode 1's entry point. */
async function sessionLogin(): Promise<void> {
    const { username, password } = credentials();
    const result = await call('/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    const session = asRecord(result.body?.['session']);
    const id = session?.['id'];
    if (typeof id === 'string') {
        sessionId = id;
        append(`[cookie] ${JSON.stringify(session?.['cookie'])}`, 'note');
    }
    report(`POST /auth/login (${username})`, result);
}

/** GET /auth/me — cookie (or Bearer session id) in, principal out. */
async function sessionMe(): Promise<void> {
    report('GET /auth/me', await call('/auth/me'));
}

/** POST /auth/elevate — privilege change; the session id rotates. */
async function sessionElevate(): Promise<void> {
    const result = await call('/auth/elevate', { method: 'POST' });
    const fixation = asRecord(result.body?.['fixation']);
    if (typeof fixation?.['sessionId'] === 'string') {
        sessionId = fixation['sessionId'];
        append(`[fixation] old id dead, new id ${String(fixation['sessionId']).slice(0, 12)}…`, 'note');
    }
    report('POST /auth/elevate', result);
}

/** POST /auth/logout. */
async function sessionLogout(): Promise<void> {
    const result = await call('/auth/logout', { method: 'POST' });
    sessionId = null;
    report('POST /auth/logout', result);
}

/** POST /jwt/login — mode 2's entry point (tokens stay in memory). */
async function jwtLogin(): Promise<void> {
    const { username, password } = credentials();
    const result = await call('/jwt/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    rememberTokens(result.body);
    report(`POST /jwt/login (${username})`, result);
}

/** POST /jwt/refresh — rotates the pair (older tokens die with it). */
async function jwtRefresh(): Promise<void> {
    const result = await call('/jwt/refresh', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ refreshToken: tokens.refresh }),
    });
    rememberTokens(result.body);
    report('POST /jwt/refresh', result);
}

/** Stores the access/refresh pair a login or refresh body returned. */
function rememberTokens(body: Record<string, unknown> | null): void {
    const access = body?.['accessToken'];
    const refresh = body?.['refreshToken'];
    if (typeof access === 'string' && typeof refresh === 'string') {
        tokens.access = access;
        tokens.refresh = refresh;
    }
}

/** GET /jwt/me, with the client refresh flow on the documented `token_expired`. */
async function jwtMe(): Promise<void> {
    if (tokens.access === null) {
        append('no access token — press "JWT login" first', 'note');
        return;
    }
    let result = await call('/jwt/me', { headers: { authorization: `Bearer ${tokens.access}` } });
    if (result.status === 401 && codeOf(result.body) === 'token_expired') {
        append('401 token_expired → refreshing once and retrying', 'note');
        await jwtRefresh();
        if (tokens.access !== null) {
            result = await call('/jwt/me', { headers: { authorization: `Bearer ${tokens.access}` } });
        }
    }
    report('GET /jwt/me', result);
}

/** GET one role-matrix row and log its status. */
async function roleCheck(path: string): Promise<void> {
    report(`GET ${path}`, await call(path));
}

/** Six wrong-password logins from one address: attempts 1–5 are 401, the sixth is 429. */
async function rateLimitBurst(): Promise<void> {
    const { username } = credentials();
    append('burst: 6 × POST /auth/login with a wrong password', 'note');
    for (let attempt = 1; attempt <= 6; attempt += 1) {
        // eslint-disable-next-line no-await-in-loop -- the burst must be sequential to hit one fixed window.
        const result = await call('/auth/login', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ username, password: 'not-the-password' }),
        });
        report(`  attempt ${attempt}`, result);
    }
}

/** Opens the admin socket with either credential kind. */
function socketProbe(useAccessToken: boolean): void {
    const token = useAccessToken ? tokens.access : sessionId;
    if (token === null) {
        append(`no ${useAccessToken ? 'access token' : 'session id'} yet — log in first`, 'note');
        return;
    }
    const scheme = location.protocol === 'https:' ? 'wss' : 'ws';
    const socket = new WebSocket(`${scheme}://${location.host}/roles/socket?token=${encodeURIComponent(token)}`);
    append(`[socket] connecting with the ${useAccessToken ? 'access token' : 'session id'}`, 'note');
    socket.addEventListener('message', (event: MessageEvent) => append(`[socket] ${String(event.data)}`, 'ok'));
    socket.addEventListener('close', (event: CloseEvent) =>
        append(`[socket] closed ${event.code} ${event.reason}`, event.code === 1008 ? 'bad' : 'note')
    );
    socket.addEventListener('error', () => append('[socket] transport error', 'bad'));
}

/** Builds the interactive panel into `#playground`. */
function render(): void {
    const root = document.getElementById('playground');
    if (root === null) return;

    const log = document.createElement('pre');
    log.id = 'log';

    const heading = document.createElement('h2');
    heading.textContent = 'Run the modes';

    const panel = document.createElement('section');
    panel.append(
        heading,
        group('Credentials', field('username', 'username', 'admin'), field('password', 'password', 'demo', 'password')),
        group(
            '1 · Opaque session cookie',
            button('Login', () => void sessionLogin()),
            button('GET /auth/me', () => void sessionMe()),
            button('Elevate (rotate id)', () => void sessionElevate()),
            button('Logout', () => void sessionLogout())
        ),
        group(
            '2 · JWT access + refresh',
            button('JWT login', () => void jwtLogin()),
            button('GET /jwt/me', () => void jwtMe()),
            button('Refresh', () => void jwtRefresh())
        ),
        group(
            '3 · Roles',
            button('GET /roles/authenticated', () => void roleCheck('/roles/authenticated')),
            button('GET /roles/admin', () => void roleCheck('/roles/admin')),
            button('GET /roles/user', () => void roleCheck('/roles/user')),
            button('WS /roles/socket (session id)', () => socketProbe(false)),
            button('WS /roles/socket (access token)', () => socketProbe(true))
        ),
        group(
            '4 · Rate limiting',
            button('Burst 6 wrong logins', () => void rateLimitBurst())
        ),
        group(
            '5 · Durable sessions',
            (() => {
                const note = document.createElement('span');
                note.textContent = 'restart the server, then press GET /auth/me again — the cookie still resolves';
                return note;
            })()
        ),
        group(
            '6 · OIDC (code + PKCE)',
            button('Start OIDC redirect', () => location.assign('/oidc/start'))
        ),
        log
    );
    root.replaceChildren(panel);

    append('panel ready — credentials default to admin/demo', 'note');
    if (new URLSearchParams(location.search).get('mode') === 'oidc') {
        append('returned from the OIDC callback — checking the session cookie it set', 'note');
        void sessionMe();
    }
}

render();
