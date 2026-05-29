import '@tsmetadata/polyfill';
import { routeMapping, routeParams, bodyValue } from '@blue/dispatcher';
import { authManager, storeToken } from './auth-store';

@routeMapping('/auth')
export class AuthController {
    @routeMapping('/login')
    @routeParams({ credentials: bodyValue('*') })
    async login(credentials: unknown) {
        const principal = await authManager.authenticate(credentials);
        if (!principal) {
            return { error: 'Invalid credentials' };
        }
        const token = storeToken(principal);
        return { token, name: principal.name, roles: principal.roles };
    }
}