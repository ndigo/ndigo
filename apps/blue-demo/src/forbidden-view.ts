/**
 * @author Jeff Rose
 */

import { View } from '@blue/view';

/**
 * Forbidden view — displayed when a user lacks the required role.
 */
export class ForbiddenView extends View {
    protected override _render(): string {
        return `
            <div class="forbidden-container">
                <h2>403 - Forbidden</h2>
                <p>You do not have permission to access this resource.</p>
                <p><a href="#/profile">Go to Profile</a></p>
            </div>
        `;
    }
}

// ── Register as a web component ──────────────────────────────────────────────
customElements.define('forbidden-view', ForbiddenView);
