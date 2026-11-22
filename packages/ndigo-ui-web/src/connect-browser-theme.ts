/**
 * Connects the application context, the browser theme cookie, and the DOM.
 */
import type { ConfigurableApplicationContext } from '@ndigo/context';
import { configureBrowserTheme, type BrowserThemeBootstrapOptions } from '@ndigo/platform-web';
import type { Route } from '@ndigo/router';
import { removeTheme, type Theme, type ThemeTarget, type VisualThemeMap } from '@ndigo/ui';
import { setVisualTheme } from './set-visual-theme';

/**
 * Options for {@link connectBrowserTheme}.
 *
 * @example
 * ```ts
 * const connection = connectBrowserTheme(context, { cookieName: 'theme' });
 * connection.setTheme('dark');
 * ```
 */
export interface ConnectBrowserThemeOptions extends BrowserThemeBootstrapOptions {
    /** Element the theme is applied to. Defaults to the document root. */
    target?: ThemeTarget;
    /** Application themes consulted before the built-ins. */
    themes?: VisualThemeMap;
}

/**
 * Handle returned by {@link connectBrowserTheme}.
 *
 * @example
 * ```ts
 * const connection = connectBrowserTheme(context);
 * const theme = connection.setTheme('dark');
 * connection.destroy();
 * ```
 */
export interface BrowserThemeConnection {
    /** The applied theme, or `undefined` before the first successful apply. */
    readonly theme: Theme | undefined;
    /** Cookie the connection reads and writes. */
    readonly cookieName: string;
    /**
     * Switches the theme: applies it, updates the context, and persists it.
     *
     * @param name - Requested theme name.
     * @returns The applied theme, or `undefined` for an unknown name.
     */
    setTheme(name: string): Theme | undefined;
    /**
     * Detaches the connection and clears the applied theme from the DOM.
     *
     * The persisted cookie is left alone, so the user's choice survives a
     * teardown; later `setTheme` calls are no-ops.
     */
    destroy(): void;
}

/**
 * Wires cookie-backed theme resolution into the browser app and applies the
 * current theme.
 *
 * One call replaces the client-side bootstrap: it installs
 * `CookieThemeResolver` (via `configureBrowserTheme`), resolves in the
 * documented order (cookie → system preference → context default), and
 * applies the result so the page matches the negotiated theme before any
 * interaction. For a full-stack app the server has already rendered the same
 * attributes; applying them again is idempotent.
 *
 * @param context - The browser application context.
 * @param options - Cookie name, seed theme, target element, and theme map.
 * @returns A handle exposing the applied theme and a one-call switcher.
 *
 * @example
 * ```ts
 * const connection = connectBrowserTheme(context);
 * connection.setTheme('dark');
 * ```
 */
export function connectBrowserTheme(
    context: ConfigurableApplicationContext,
    options: ConnectBrowserThemeOptions = {}
): BrowserThemeConnection {
    const cookieName = options.cookieName ?? 'theme';
    const resolver = configureBrowserTheme(context, {
        cookieName,
        themeName: options.themeName,
    });

    // Resolvers ignore the route: the transport input already lives in the
    // cookie jar. The empty route satisfies the shared resolver contract.
    const resolvedName = resolver.resolveThemeName({ attributes: {} } as Route);

    let active = true;
    let current = setVisualTheme(context, resolvedName, {
        target: options.target,
        themes: options.themes,
        cookieName,
        persist: false,
    });

    return {
        get theme() {
            return current;
        },
        cookieName,
        setTheme(name: string): Theme | undefined {
            if (!active) {
                return undefined;
            }

            const applied = setVisualTheme(context, name, {
                target: options.target,
                themes: options.themes,
                cookieName,
            });

            if (applied) {
                current = applied;
            }

            return applied;
        },
        destroy(): void {
            if (!active) {
                return;
            }

            active = false;
            current = undefined;
            removeTheme(options.target);
        },
    };
}
