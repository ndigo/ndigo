/**
 * @module ndigo-todo
 * @since 1.0.0
 * @author Jeff Rose
 */
import { routeMapping, parameters, pathValue, ModelAndView } from '@ndigo/dispatcher';
import { traced } from '@ndigo/telemetry';
import { getLogger } from '@ndigo/log';

const logger = getLogger('ndigo-todo:auth-controller');

/**
 * Serves the demo's `/auth/*` views through the shared dispatcher. The shell's
 * `AuthRouterInterceptor` guards `/auth/profile` (authenticated) and
 * `/auth/admin` (admin role) and redirects rejected navigations to
 * `/auth/login` / `/auth/forbidden`.
 */
@routeMapping('/auth')
class AuthController {
    @routeMapping('/login')
    @parameters({ path: pathValue() })
    @traced
    handleLogin(path: string) {
        logger.info('Handling route', { path: path });

        return new ModelAndView('auth-app', { page: 'login' });
    }

    @routeMapping('/profile')
    @parameters({ path: pathValue() })
    @traced
    handleProfile(path: string) {
        logger.info('Handling route', { path: path });

        return new ModelAndView('auth-app', { page: 'profile' });
    }

    @routeMapping('/admin')
    @parameters({ path: pathValue() })
    @traced
    handleAdmin(path: string) {
        logger.info('Handling route', { path: path });

        return new ModelAndView('auth-app', { page: 'admin' });
    }

    @routeMapping('/forbidden')
    @parameters({ path: pathValue() })
    @traced
    handleForbidden(path: string) {
        logger.info('Handling route', { path: path });

        return new ModelAndView('auth-app', { page: 'forbidden' });
    }
}

export default AuthController;
