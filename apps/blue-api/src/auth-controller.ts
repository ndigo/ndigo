import '@tsmetadata/polyfill';
import { postMapping, routeParams, bodyValue } from '@blue/dispatcher';
import { ResponseEntity } from '@blue/platform-node';
import { authenticate } from './auth-store';

@postMapping('/auth')
export class AuthController {
    /**
     * POST /auth/login — authenticates a user and returns a token.
     * Returns 401 with an error body on bad credentials.
     */
    @postMapping('/login')
    @routeParams({ credentials: bodyValue('*') })
    async login(credentials: unknown) {
        const username = (credentials as { username?: unknown })?.username;
        const password = (credentials as { password?: unknown })?.password;

        const token = await authenticate(String(username ?? ''), String(password ?? ''));
        if (!token) {
            return ResponseEntity.unauthorized({ error: 'Invalid credentials' }, { 'WWW-Authenticate': 'Bearer' });
        }

        // Extract principal info from token for demo purposes
        const parts = token.split('-');
        const name = parts[2];
        const roles = name === 'admin' ? ['admin', 'user'] : ['user'];

        return { token, name, roles };
    }
}
