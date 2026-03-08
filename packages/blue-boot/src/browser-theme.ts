/**
 * @author Jeff Rose
 */

import { ConfigurableApplicationContext } from '@blue/context';
import { CookieThemeResolver, configureCookieThemeResolver } from '@blue/platform-web';

export type BrowserThemeBootstrapOptions = {
    cookieName?: string;
    themeName?: string;
};

/**
 * Configures browser theme support for an application context by wiring
 * cookie-backed theme resolution into the dispatcher strategy key.
 */
export const configureBrowserTheme = (
    applicationContext: ConfigurableApplicationContext,
    options: BrowserThemeBootstrapOptions = {}
): CookieThemeResolver => {
    if (options.themeName) {
        applicationContext.setThemeName(options.themeName);
    }

    return configureCookieThemeResolver(applicationContext, options.cookieName || 'theme');
};
