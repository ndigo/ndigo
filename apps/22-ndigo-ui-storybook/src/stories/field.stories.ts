/**
 * Storybook stories for the Ndigo UI field component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Field',
    tags: ['autodocs'],
    render: () =>
        html`<div class="nd-field">
            <label class="nd-label" for="email" data-required>Email</label>
            <input
                class="nd-input"
                id="email"
                name="email"
                type="email"
                aria-describedby="email-help email-error"
                aria-invalid="true"
            />
            <p class="nd-help" id="email-help">We only use this for account notices.</p>
            <p class="nd-error" id="email-error">Enter a valid email address.</p>
        </div>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
