/**
 * Storybook stories for the Ndigo UI item component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Item',
    tags: ['autodocs'],
    render: () =>
        html`<ul class="nd-list">
            <li class="nd-item nd-item--bordered">
                <span class="nd-item__media">AL</span>
                <div class="nd-item__content">
                    <span class="nd-item__title">Ada Lovelace</span>
                    <span class="nd-item__description">Engineering</span>
                </div>
                <div class="nd-item__actions">
                    <button class="nd-button" data-variant="ghost" data-size="sm" type="button">Edit</button>
                </div>
            </li>
        </ul>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
