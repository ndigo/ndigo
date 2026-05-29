import { AuthenticationManager, Principal } from '@blue/auth';

// Demo credentials
const DEMO_USERS = [
    { username: 'admin', password: 'demo', roles: ['admin', 'user'] },
    { username: 'alice', password: 'demo', roles: ['user'] },
];

// Token → Principal map (in-memory "session store")
const tokenStore = new Map<string, Principal>();

// Strategy: accepts { username: string, password: string }
interface PasswordCredentials { username: string; password: string; }

export const authManager = new AuthenticationManager();
authManager.register({
    supports(c: unknown): c is PasswordCredentials {
        return typeof c === 'object' && c !== null && 'username' in c && 'password' in c;
    },
    async authenticate(c: PasswordCredentials): Promise<Principal | null> {
        const user = DEMO_USERS.find(u => u.username === c.username && u.password === c.password);
        if (!user) return null;
        return {
            id: user.username,
            name: user.username,
            roles: user.roles,
            hasRole(role: string) { return this.roles.includes(role); },
            hasAnyRole(...roles: string[]) { return roles.some(r => this.roles.includes(r)); },
        };
    }
});

/** Store a principal under a token and return the token. */
export function storeToken(principal: Principal): string {
    const token = `demo-token-${principal.id}-${Date.now()}`;
    tokenStore.set(token, principal);
    return token;
}

/** Look up a principal by token. Returns null if not found. */
export function lookupToken(token: string): Principal | null {
    return tokenStore.get(token) ?? null;
}