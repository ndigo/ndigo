/**
 * Demo component showing reactive locale switching: a persisted user choice
 * (`changeLocale` → cookie + signal) that re-renders subscribed views without
 * a reload.
 * @module ndigo-todo
 * @since 1.0.0
 * @author Jeff Rose
 */
import { changeLocale, currentLocale } from '@ndigo/platform-web';
import { effect } from '@ndigo/signals';
import { MessageSource, likeMessageSource } from '@ndigo/content';

const template = document.createElement('template');
template.innerHTML = `
    <div class="locale-switcher">
        <span class="locale-label"></span>
        <button data-locale="en">EN</button>
        <button data-locale="fr">FR</button>
    </div>
`;

class LocaleSwitcherView extends HTMLElement {
    #messages: MessageSource | null = null;
    #stop: (() => void) | null = null;
    $label: HTMLElement | null = null;

    /**
     * The message source used for the switcher label (the shell context).
     *
     * @param source - Any value; only actual message sources are accepted.
     */
    set messages(source: unknown) {
        this.#messages = likeMessageSource(source) ? source : null;
        void this._render();
    }

    constructor() {
        super();
    }

    connectedCallback() {
        this.appendChild(template.content.cloneNode(true));
        this.$label = this.querySelector('.locale-label');

        this.querySelectorAll('button[data-locale]').forEach((button) => {
            button.addEventListener('click', () => {
                const locale = button.getAttribute('data-locale');
                if (locale) {
                    changeLocale(locale);
                }
            });
        });

        // Reactive: re-render whenever the locale signal changes.
        this.#stop = effect(() => {
            void currentLocale.value;
            void this._render();
        });
        void this._render();
    }

    disconnectedCallback() {
        this.#stop?.();
        this.#stop = null;
    }

    /** Updates the label for the current locale. */
    async _render(): Promise<void> {
        if (!this.$label) {
            return;
        }
        const locale = currentLocale.value;
        const message = this.#messages
            ? await this.#messages.getMessage('locale.current', { values: { language: locale.toUpperCase() } }, locale)
            : locale;
        this.$label.textContent = message;
    }
}

customElements.define('locale-switcher', LocaleSwitcherView);
