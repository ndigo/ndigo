/**
 * @author Jeff Rose
 *
 * Demo component showing the @blue/signals decorator API.
 *
 * A simple counter with increment/decrement, demonstrating:
 * - @signal for reactive state
 * - @computed for derived values
 * - @effect for side effects
 * - @reactive for lifecycle management
 */

import { AbstractWebComponent } from '@blue/view-webcomponent';
import { signal, computed, effect, reactive } from '@blue/signals/decorators';

const template = document.createElement('template');
template.innerHTML = `
    <div class="signals-counter">
        <h2>Signals Counter Demo</h2>
        <p class="count-display">Count: <span id="count-value">0</span></p>
        <p class="doubled-display">Doubled: <span id="doubled-value">0</span></p>
        <button id="decrement">-</button>
        <button id="increment">+</button>
        <button id="reset">Reset</button>
    </div>
`;

@reactive
class SignalsCounterView extends AbstractWebComponent {
    @signal count = 0;

    @computed get doubled() {
        return this.count * 2;
    }

    constructor() {
        super();
    }

    /** Updates the displayed count and doubled values in the shadow DOM. */
    render(): void {
        const shadow = this.shadowRoot;
        if (!shadow) return;
        shadow.getElementById('count-value')!.textContent = String(this.count);
        shadow.getElementById('doubled-value')!.textContent = String(this.doubled);
    }

    /** Reactive side effect: re-renders whenever `count` (and thus `doubled`) changes. */
    @effect updateDisplay(): void {
        this.render();
    }

    connectedCallback(): void {
        super.connectedCallback();
        const shadow = this.shadowRoot!;
        shadow.getElementById('increment')!.addEventListener('click', () => this.count++);
        shadow.getElementById('decrement')!.addEventListener('click', () => this.count--);
        shadow.getElementById('reset')!.addEventListener('click', () => { this.count = 0; });
    }
}

customElements.define('signals-counter', SignalsCounterView);