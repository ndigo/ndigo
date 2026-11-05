/**
 * The settings route (`#/settings`).
 *
 * The route is behind the auth guard, so this controller only ever renders for
 * a signed-in visitor; it projects the account and its form-scoped envelope for
 * the view.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AsApplicationContextAware, type ApplicationContext } from '@ndigo/context';
import { Null } from '@ndigo/core';
import { ModelAndView, parameters, pathValue, routeMapping } from '@ndigo/dispatcher';
import { SESSION_SERVICE } from '../app/conduit-tokens';
import type { SettingsModel } from '../views/models';

@routeMapping('/settings')
export default class SettingsController extends AsApplicationContextAware(Null) {
    /** Injected by the container (`ApplicationContextAware`). */
    declare readonly applicationContext: ApplicationContext;

    /**
     * Serves the settings form.
     *
     * @param path - The matched route path.
     * @returns The settings model.
     */
    @routeMapping('/')
    @parameters({ path: pathValue() })
    handleSettings(path: string): ModelAndView {
        void path;
        const session = this.applicationContext.getValue(SESSION_SERVICE);
        const model: SettingsModel = { session: session.toModel(), errors: session.errorsFor('settings') };
        return new ModelAndView('conduit-settings', model);
    }
}
