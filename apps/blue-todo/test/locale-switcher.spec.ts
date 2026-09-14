/**
 * @module blue-todo
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment jsdom
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { LOCALE_COOKIE_NAME, currentLocale } from '@blue/platform-web';
import { MessageSource } from '@blue/content';
import { I18nextMessageSource } from '@blue/content-i18next';
import '../src/locale-switcher-view';

/** The same resources the todo context installs on the shell context. */
const demoResources = {
    en: { translation: { 'locale.current': 'Language: {{language}}' } },
    fr: { translation: { 'locale.current': 'Langue : {{language}}' } },
};

const resetCookies = () => {
    document.cookie = `${LOCALE_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
};

describe('locale-switcher view (AD-19 demo)', () => {
    let messages: MessageSource;

    beforeEach(() => {
        resetCookies();
        messages = new I18nextMessageSource({
            resources: demoResources,
            language: 'en',
            fallbackLanguage: 'en',
        });
    });

    afterEach(() => {
        document.body.innerHTML = '';
        resetCookies();
    });

    const createSwitcher = (): HTMLElement & { messages?: unknown } => {
        const switcher = document.createElement('locale-switcher') as HTMLElement & { messages?: unknown };
        switcher.messages = messages;
        document.body.appendChild(switcher);
        return switcher;
    };

    test('renders the current locale label from the message source', () => {
        const switcher = createSwitcher();

        expect(switcher.querySelector('.locale-label')?.textContent).toBe('Language: EN-US');
    });

    test('switching locale re-renders without a reload and persists the cookie', () => {
        const switcher = createSwitcher();

        const frButton = [...switcher.querySelectorAll<HTMLButtonElement>('button[data-locale]')].find(
            (button) => button.getAttribute('data-locale') === 'fr'
        );
        if (!frButton) {
            throw new Error('expected an FR button');
        }
        frButton.click();

        expect(switcher.querySelector('.locale-label')?.textContent).toBe('Langue : FR');
        expect(currentLocale.value).toBe('fr');
        expect(document.cookie).toContain(`${LOCALE_COOKIE_NAME}=fr`);
    });
});
