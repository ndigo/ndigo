/**
 * @author Jeff Rose
 */

import { View } from '@blue/view';
import { login } from './auth-store';

/**
 * Login form view — a simple web component that handles user login.
 *
 * Expects to be placed in a container element. On successful login,
 * dispatches a `user:login:success` event with the principal data.
 */
export class LoginView extends View {
    protected override _render(): string {
        return `
            <div class="login-container">
                <h2>Login</h2>
                <form id="login-form">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" name="username" placeholder="admin or alice" required />
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" placeholder="demo" required />
                    </div>
                    <div id="error" class="error" style="display: none;"></div>
                    <button type="submit" id="login-btn">Login</button>
                </form>
                <p class="demo-notice">Demo credentials: admin/demo or alice/demo</p>
            </div>
        `;
    }

    protected override _attach(): void {
        const form = this.element.querySelector('#login-form') as HTMLFormElement;
        form?.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = (form.querySelector('#username') as HTMLInputElement)?.value;
            const password = (form.querySelector('#password') as HTMLInputElement)?.value;
            const errorEl = this.element.querySelector('#error') as HTMLDivElement;

            try {
                const result = await login(username ?? '', password ?? '');
                if (!result) {
                    errorEl.textContent = 'Invalid credentials. Try admin/demo or alice/demo.';
                    errorEl.style.display = 'block';
                    return;
                }

                // Dispatch success event with principal data
                this.element.dispatchEvent(new CustomEvent('user:login:success', {
                    bubbles: true,
                    detail: {
                        principal: result.principal,
                        token: result.token,
                    },
                }));
            } catch {
                errorEl.textContent = 'Login failed. Please try again.';
                errorEl.style.display = 'block';
            }
        });
    }
}

// ── Register as a web component ──────────────────────────────────────────────
customElements.define('login-view', LoginView);
