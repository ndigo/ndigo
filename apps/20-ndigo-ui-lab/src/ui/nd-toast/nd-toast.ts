/**
 * `<nd-toast>` — native-first transient notification.
 *
 * A single toast with a live-region contract, programmatic `show()`/`hide()`,
 * and an optional auto-dismiss timer. The Zag toast machine is group-scoped
 * (it requires a parent group service); this element deliberately stays a
 * single toast until a queue/group item is designed.
 */
import { defineElement, NdElement } from '@/lib/base-element';

const DEFAULT_DURATION = 5000;

export class NdToast extends NdElement {
    static observedAttributes = ['open', 'type', 'duration'];

    #timer: ReturnType<typeof setTimeout> | undefined;
    #listeners: AbortController | undefined;

    protected onConnect(): void {
        this.#applyLiveRegion();
        if (this.hasAttribute('open')) this.#open();
        else this.#close(false);

        this.#listeners?.abort();
        this.#listeners = new AbortController();
        this.querySelector('[data-part="close-trigger"]')?.addEventListener('click', () => this.hide(), {
            signal: this.#listeners.signal,
        });
    }

    protected onDisconnect(): void {
        this.#clearTimer();
        this.#listeners?.abort();
        this.#listeners = undefined;
    }

    attributeChangedCallback(name: string, _previous: string | null, value: string | null): void {
        if (!this.isConnected) return;
        if (name === 'type') {
            this.#applyLiveRegion();
            return;
        }
        if (name === 'duration') {
            if (this.hasAttribute('open')) this.#schedule();
            return;
        }
        if (value === null) this.#close(true);
        else this.#open();
    }

    /** Shows the toast and (re)starts its auto-dismiss timer. */
    show(): void {
        if (this.hasAttribute('open')) {
            this.#open();
            return;
        }
        this.setAttribute('open', '');
    }

    /** Hides the toast. */
    hide(): void {
        if (!this.hasAttribute('open')) return;
        this.removeAttribute('open');
    }

    #applyLiveRegion(): void {
        const type = this.getAttribute('type') ?? 'info';
        const assertive = type === 'error' || type === 'warning';
        this.setAttribute('role', assertive ? 'alert' : 'status');
        this.setAttribute('aria-live', assertive ? 'assertive' : 'polite');
        this.setAttribute('aria-atomic', 'true');
        this.dataset.type = type;
    }

    #open(): void {
        this.hidden = false;
        this.dataset.state = 'open';
        this.#schedule();
        this.emit('open-change', { open: true });
    }

    #close(emit: boolean): void {
        this.#clearTimer();
        this.hidden = true;
        this.dataset.state = 'closed';
        if (emit) this.emit('open-change', { open: false });
    }

    #schedule(): void {
        this.#clearTimer();
        const raw = this.getAttribute('duration');
        const duration = raw === null ? DEFAULT_DURATION : Number(raw);
        if (!Number.isFinite(duration) || duration <= 0) return;
        this.#timer = setTimeout(() => this.hide(), duration);
    }

    #clearTimer(): void {
        if (this.#timer !== undefined) {
            clearTimeout(this.#timer);
            this.#timer = undefined;
        }
    }
}

defineElement('nd-toast', NdToast);
