/**
 * The authentication routes (`#/login`, `#/register`).
 *
 * Two controllers rather than one because each class-level mapping owns exactly
 * one public path; both render the same `conduit-auth` component, discriminated
 * by the `page` member, and both hand it the session-shaped envelope for *their*
 * form (`FormErrorState` is form-scoped, so a login failure never renders on the
 * register form).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AsApplicationContextAware, type ApplicationContext } from '@ndigo/context';
import { Null } from '@ndigo/core';
import { ModelAndView, parameters, pathValue, routeMapping } from '@ndigo/dispatcher';
import { SESSION_SERVICE } from '../app/conduit-tokens';
import type { AuthModel } from '../views/models';

/** The sign-in form (`#/login`). */
@routeMapping('/login')
export class LoginController extends AsApplicationContextAware(Null) {
    /** Injected by the container (`ApplicationContextAware`). */
    declare readonly applicationContext: ApplicationContext;

    /**
     * Serves the sign-in page.
     *
     * @param path - The matched route path.
     * @returns The auth model for the login form.
     */
    @routeMapping('/')
    @parameters({ path: pathValue() })
    handleLogin(path: string): ModelAndView {
        void path;
        const session = this.applicationContext.getValue(SESSION_SERVICE);
        const model: AuthModel = { page: 'login', session: session.toModel(), errors: session.errorsFor('login') };
        return new ModelAndView('conduit-auth', model);
    }
}

/** The registration form (`#/register`). */
@routeMapping('/register')
export class RegisterController extends AsApplicationContextAware(Null) {
    /** Injected by the container (`ApplicationContextAware`). */
    declare readonly applicationContext: ApplicationContext;

    /**
     * Serves the registration page.
     *
     * @param path - The matched route path.
     * @returns The auth model for the register form.
     */
    @routeMapping('/')
    @parameters({ path: pathValue() })
    handleRegister(path: string): ModelAndView {
        void path;
        const session = this.applicationContext.getValue(SESSION_SERVICE);
        const model: AuthModel = {
            page: 'register',
            session: session.toModel(),
            errors: session.errorsFor('register'),
        };
        return new ModelAndView('conduit-auth', model);
    }
}
