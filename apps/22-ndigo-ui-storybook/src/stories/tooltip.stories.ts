/**
 * Storybook stories for the Ndigo UI tooltip component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Tooltip',
    tags: ['autodocs'],
    render: () =>
        html`<nd-tooltip open-delay="200" close-delay="100">
            <button data-part="trigger">Info</button>
            <div data-part="positioner">
                <div data-part="content">The shortcut is Ctrl+K.</div>
            </div>
        </nd-tooltip>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
