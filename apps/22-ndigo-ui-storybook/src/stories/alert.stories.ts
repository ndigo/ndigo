/**
 * Storybook stories for the Ndigo UI alert component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Alert',
    tags: ['autodocs'],
    render: () =>
        html`<div class="nd-alert" data-variant="success" role="status">
            <span class="nd-alert__icon" aria-hidden="true">✓</span>
            <div class="nd-alert__content">
                <p class="nd-alert__title">Saved</p>
                <p class="nd-alert__description">The invoice was updated.</p>
            </div>
        </div>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
