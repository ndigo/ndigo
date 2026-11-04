/**
 * @module ndigo-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { effect } from '@ndigo/signals';
import { LOCALE_COOKIE_NAME, changeLocale, currentLocale } from '../src/locale';

describe('@ndigo/platform-web locale signal', () => {
    beforeEach(() => {
        document.cookie = `${LOCALE_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });

    afterEach(() => {
        document.cookie = `${LOCALE_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });

    test('changeLocale updates the signal and persists the cookie', () => {
        const seen = vi.fn();
        const stop = effect(() => {
            seen(currentLocale.value);
        });

        changeLocale('fr');
        expect(currentLocale.value).toBe('fr');
        expect(seen).toHaveBeenLastCalledWith('fr');
        expect(document.cookie).toContain(`${LOCALE_COOKIE_NAME}=fr`);

        changeLocale('de');
        expect(currentLocale.value).toBe('de');
        expect(seen).toHaveBeenLastCalledWith('de');

        stop();
    });

    test('subscribers do not fire for unchanged locale state', () => {
        const seen = vi.fn();
        const stop = effect(() => {
            seen(currentLocale.value);
        });

        changeLocale('fr');
        const callsAfterFirst = seen.mock.calls.length;
        currentLocale.value = 'fr';
        expect(seen.mock.calls.length).toBe(callsAfterFirst);

        stop();
    });

    test('invalid tags are ignored — signal and cookie stay untouched', () => {
        const before = currentLocale.value;
        const cookieBefore = document.cookie;

        changeLocale('" autofocus onfocus="alert(1)');
        expect(currentLocale.value).toBe(before);
        expect(document.cookie).toBe(cookieBefore);

        changeLocale('');
        expect(currentLocale.value).toBe(before);
    });

    test('changeLocale canonicalizes the persisted tag', () => {
        changeLocale('EN-us');
        expect(currentLocale.value).toBe('en-US');
        expect(document.cookie).toContain(`${LOCALE_COOKIE_NAME}=en-US`);
    });
});
