/**
 * Browser locale signal and helpers.
 */
import { Signal, signal } from '@ndigo/signals';
import { normalizeLocale } from '@ndigo/content';
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

let localeSignal: Signal<string> | undefined;

/**
 * Resolves (and memoizes) the locale signal, reading the persisted cookie /
 * navigator language on first use. Deferring this keeps importing the barrel
 * free of any browser-global access outside a DOM.
 */
const resolveLocaleSignal = (): Signal<string> => (localeSignal ??= signal(resolveInitialLocale()));

/**
 * Reactive locale state for the browser — views subscribed to this signal
 * re-render and re-format when the locale changes.
 *
 * Backed by a lazily-created signal so importing the module outside a DOM
 * never touches `document`/`navigator`.
 */
export const currentLocale: Signal<string> = new Proxy(Object.create(null) as Signal<string>, {
    get: (_target, property) => {
        const target = resolveLocaleSignal();
        const value = Reflect.get(target, property, target) as unknown;
        return typeof value === 'function' ? value.bind(target) : value;
    },
    set: (_target, property, value) => Reflect.set(resolveLocaleSignal(), property, value, resolveLocaleSignal()),
});

/**
 * Sets the active locale on the client.
 *
 * Persists the user's choice (cookie) and updates {@link currentLocale},
 * so subscribed views re-render with the new locale. Subsequent requests
 * resolve the cookie first via {@link "cookie-language-resolver".CookieLanguageResolver | CookieLanguageResolver}.
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
