/**
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Signal, signal } from '@blue/signals';
import { normalizeLocale } from '@blue/content';
import Cookies from './cookies';

/**
 * The cookie name persisting the user's locale choice.
 */
export const LOCALE_COOKIE_NAME = 'lang';

const DEFAULT_LOCALE = 'en-US';

const resolveInitialLocale = (): string => {
    const cookieValue = Cookies.get(LOCALE_COOKIE_NAME);
    const fromCookie = normalizeLocale(cookieValue);
    if (fromCookie) {
        return fromCookie;
    }
    if (typeof navigator !== 'undefined') {
        return normalizeLocale(navigator.language) ?? DEFAULT_LOCALE;
    }
    return DEFAULT_LOCALE;
};

/**
 * Reactive locale state for the browser — views subscribed to this signal
 * re-render and re-format when the locale changes.
 */
export const currentLocale: Signal<string> = signal(resolveInitialLocale());

/**
 * Sets the active locale on the client.
 *
 * Persists the user's choice (cookie) and updates {@link currentLocale},
 * so subscribed views re-render with the new locale. Subsequent requests
 * resolve the cookie first via {@link CookieLanguageResolver}.
 *
 * Invalid tags (non-BCP 47, markup characters, overlong) are ignored —
 * the current locale and cookie are left untouched.
 *
 * @param language - The language tag to activate.
 */
export function changeLocale(language: string): void {
    const normalized = normalizeLocale(language);
    if (!normalized) {
        return;
    }
    Cookies.set(LOCALE_COOKIE_NAME, normalized, { path: '/', expires: 365 });
    currentLocale.value = normalized;
}
