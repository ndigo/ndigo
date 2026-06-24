/**
 * @author opencode
 */

import '@tsmetadata/polyfill';
import { routeMapping, routeParams, bodyValue } from '@blue/dispatcher';
import { authenticate } from './auth-store';

@routeMapping('/auth')
export class AuthController {
    @routeMapping('/login')
    @routeParams({ credentials: bodyValue('*') })
    async login(credentials: unknown) {
        const username = (credentials as any)?.username;
        const password = (credentials as any)?.password;
        
        const token = await authenticate(username, password);
        if (!token) {
            return { error: 'Invalid credentials' };
        }

        // Extract principal info from token for demo purposes
        const parts = token.split('-');
        const name = parts[2];
        const roles = name === 'admin' ? ['admin', 'user'] : ['user'];

        return { token, name, roles };
    }
}
