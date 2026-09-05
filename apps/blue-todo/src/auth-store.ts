import { AuthClient, AuthRegistry, OIDCAdapter, Principal } from '@blue/auth-client';

// ── Demo credentials (in-memory, for demo only) ──────────────────────────────
const DEMO_USERS = [
    { username: 'admin', password: 'demo', roles: ['admin', 'user'] },
    { username: 'alice', password: 'demo', roles: ['user'] },
];

// ── In-memory token → Principal store ────────────────────────────────────────
const tokenStore = new Map<string, Principal>();

/**
 * Generates a demo token for a principal.
 */
function generateToken(principal: Principal): string {
    const token = `demo-token-${principal.id}-${Date.now()}`;
    tokenStore.set(token, principal);
    return token;
}

/**
 * Looks up a principal by token.
 */
export function lookupPrincipal(token: string): Principal | null {
    return tokenStore.get(token) ?? null;
}

/**
 * Invalidates a token (logs out the user).
 */
export function invalidateToken(token: string): void {
    tokenStore.delete(token);
}

// ── AuthClient instance ──────────────────────────────────────────────────────
export const authClient = new AuthClient();

// ── Initialize auth system (register adapters, set up client) ────────────────
export function initAuth(): void {
    // Demo adapter: explicit validator, NOT a real security boundary. Real
    // deployments must use jwksUrl or discovery: true against a trusted IdP.
    const oidcAdapter = new OIDCAdapter({
        issuer: 'https://blue-todo.local',
        clientId: 'blue-todo-client',
        redirectUri: `${window.location.origin}/callback`,
        scopes: ['openid', 'profile', 'email'],
        tokenValidator: async () => true,
    });
    AuthRegistry.register(oidcAdapter);

    // Initialize client with a stored token if available
    const storedToken = sessionStorage.getItem('blue-todo-token');
    if (storedToken) {
        void authClient.init('oidc', storedToken);
    }
}

// ── Login (demo: in-memory credential check) ─────────────────────────────────
export async function login(
    username: string,
    password: string
): Promise<{ token: string; principal: Principal } | null> {
    const user = DEMO_USERS.find((u) => u.username === username && u.password === password);
    if (!user) return null;

    const principal: Principal = {
        id: user.username,
        name: user.username,
        roles: user.roles,
        hasRole(role: string) {
            return this.roles.includes(role);
        },
        hasAnyRole(...roles: string[]) {
            return roles.some((r) => this.roles.includes(r));
        },
    };

    const token = generateToken(principal);
    sessionStorage.setItem('blue-todo-token', token);

    await authClient.authenticate('oidc', { principal, token, expiresAt: Date.now() + 3600000 });

    return { token, principal };
}

// ── Logout ───────────────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
    const token = authClient.state.token;
    if (token) {
        invalidateToken(token);
    }
    sessionStorage.removeItem('blue-todo-token');
    await authClient.logout('oidc');
}

// ── Check if current user has a role ─────────────────────────────────────────
export function hasRole(role: string): boolean {
    return authClient.principal?.hasRole(role) ?? false;
}
