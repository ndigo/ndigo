/**
 * @author Jeff Rose
 */

import { View } from '@blue/view';
import { authClient, logout, hasRole } from './auth-store';

/**
 * Profile view — displays authenticated user info and logout button.
 * This is a protected view that should only be shown when authenticated.
 */
export class ProfileView extends View {
    protected override _render(): string {
        const principal = authClient.principal;
        if (!principal) {
            return '<p>Please <a href="#/login">login</a> to view your profile.</p>';
        }

        return `
            <div class="profile-container">
                <h2>Profile</h2>
                <div class="profile-info">
                    <p><strong>ID:</strong> ${principal.id}</p>
                    <p><strong>Name:</strong> ${principal.name}</p>
                    <p><strong>Roles:</strong> ${principal.roles.length > 0 ? principal.roles.join(', ') : 'None'}</p>
                    <p><strong>Has admin role:</strong> ${hasRole('admin') ? 'Yes' : 'No'}</p>
                    <p><strong>Authenticated:</strong> ${authClient.isAuthenticated ? 'Yes' : 'No'}</p>
                </div>
                <button id="logout-btn">Logout</button>
            </div>
        `;
    }

    protected override _attach(): void {
        const logoutBtn = this.element.querySelector('#logout-btn') as HTMLButtonElement;
        logoutBtn?.addEventListener('click', async () => {
            await logout();
            // Navigate to login after logout
            if (window.location.hash !== '#/login') {
                window.location.hash = '#/login';
            }
        });
    }
}

// ── Register as a web component ──────────────────────────────────────────────
customElements.define('profile-view', ProfileView);
