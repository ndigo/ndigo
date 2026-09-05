import { ConfigurableApplicationContext } from '@blue/context';
import { CookieThemeResolver, configureCookieThemeResolver } from './cookie-theme-resolver';

/**
 * Options used to bootstrap browser theme support.
 */
export type BrowserThemeBootstrapOptions = {
    /**
     * Cookie name used to store the selected theme.
     */
    cookieName?: string;

    /**
     * Theme name to set on the application context before resolver setup.
     */
    themeName?: string;
};

/**
 * Configures browser theme support for an application context by wiring
 * cookie-backed theme resolution into the dispatcher strategy key.
 *
 * @param applicationContext - The application context to configure.
 * @param options - Optional browser theme bootstrap settings.
 * @returns The configured cookie theme resolver.
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
