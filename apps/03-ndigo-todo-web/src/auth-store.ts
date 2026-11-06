/**
 */
import {
    AuthClient,
    AuthRegistry,
    DefaultPrincipal,
    type AuthAdapter,
    type AuthResult,
    type Principal,
} from '@ndigo/auth-client';

// ── Demo credentials (in-memory, for demo only) ──────────────────────────────
const DEMO_USERS = [
    { username: 'admin', password: 'demo', roles: ['admin', 'user'] },
    { username: 'alice', password: 'demo', roles: ['user'] },
];

const TOKEN_TTL_MS = 3_600_000;

// ── In-memory token → Principal store ────────────────────────────────────────
const tokenStore = new Map<string, { principal: Principal; expiresAt: number }>();

/**
 * Demo auth adapter: in-memory credentials + tokens, for the browser demo only.
 *
 * It implements the framework {@link AuthAdapter} contract the way a real
 * provider does — unlike `OIDCAdapter`, whose `authenticate()` by design throws
 * (OIDC uses the authorization-code flow, not direct credentials). This is the
 * seam the demo's login form drives.
 */
class DemoAuthAdapter implements AuthAdapter {
    readonly id = 'demo';

    async authenticate(credentials: unknown): Promise<AuthResult> {
        const { username, password } = (credentials ?? {}) as { username?: string; password?: string };
        const user = DEMO_USERS.find((candidate) => candidate.username === username && candidate.password === password);

        if (!user) {
            return { principal: null, token: null, expiresAt: null };
        }

        const principal = new DefaultPrincipal(user.username, user.username, user.roles);
        const expiresAt = Date.now() + TOKEN_TTL_MS;
        const token = `demo-token-${principal.id}-${expiresAt}`;
        tokenStore.set(token, { principal, expiresAt });

        return { principal, token, expiresAt };
    }

    async validate(token: string): Promise<Principal | null> {
        const entry = tokenStore.get(token);

        if (!entry || entry.expiresAt <= Date.now()) {
            tokenStore.delete(token);
            return null;
        }

        return entry.principal;
    }

    async refresh(token: string): Promise<AuthResult> {
        const principal = await this.validate(token);
        if (!principal) {
            return { principal: null, token: null, expiresAt: null };
        }
        const expiresAt = Date.now() + TOKEN_TTL_MS;
        // A refresh MUST persist the extended lease, not just report it: if the
        // store keeps the old deadline, the next validate() logs the user out
        // at the *original* expiry and the client/server disagree on lifetime.
        tokenStore.set(token, { principal, expiresAt });
        return { principal, token, expiresAt };
    }

    async logout(token: string): Promise<void> {
        tokenStore.delete(token);
    }
}

// ── AuthClient instance ──────────────────────────────────────────────────────
export const authClient = new AuthClient();

// ── Initialize auth system (register adapter, restore a stored token) ────────
export function initAuth(): void {
    AuthRegistry.register(new DemoAuthAdapter());

    const storedToken = sessionStorage.getItem('ndigo-todo-token');
    if (storedToken) {
        void authClient.init('demo', storedToken);
    }
}

// ── Login (demo: in-memory credential check through the adapter) ─────────────
export async function login(
    username: string,
    password: string
): Promise<{ token: string; principal: Principal } | null> {
    const result = await authClient.authenticate('demo', { username, password });

    if (!result.principal || !result.token) {
        return null;
    }

    sessionStorage.setItem('ndigo-todo-token', result.token);

    return { token: result.token, principal: result.principal };
}

// ── Logout ───────────────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
    sessionStorage.removeItem('ndigo-todo-token');
    await authClient.logout('demo');
}
