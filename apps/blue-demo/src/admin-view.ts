/**
 * @author Jeff Rose
 */

import { View } from '@blue/view';
import { hasRole } from './auth-store';

/**
 * Admin panel view — requires the 'admin' role to access.
 */
export class AdminView extends View {
    protected override _render(): string {
        const isAdmin = hasRole('admin');

        return `
            <div class="admin-container">
                <h2>Admin Panel</h2>
                ${isAdmin
                    ? '<p>Welcome, administrator. This is a protected admin area.</p>'
                    : '<p class="error">Access denied. Admin role required.</p>'
                }
            </div>
        `;
    }
}

// ── Register as a web component ──────────────────────────────────────────────
customElements.define('admin-view', AdminView);
