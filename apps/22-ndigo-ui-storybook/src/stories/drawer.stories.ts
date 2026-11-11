/**
 * Storybook stories for the Ndigo UI drawer component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Drawer',
    tags: ['autodocs'],
    render: () =>
        html`<nd-drawer placement="end">
            <button data-part="trigger">Open drawer</button>
            <div data-part="content">
                <h2 data-part="title">Filters</h2>
                <p data-part="description">Narrow the list.</p>
                <button data-part="close-trigger">Close</button>
                <p>Your content goes here.</p>
            </div>
        </nd-drawer>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
