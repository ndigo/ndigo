/**
 * Storybook stories for the Ndigo UI badge component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Badge',
    tags: ['autodocs'],
    render: () =>
        html`<span class="nd-badge">Draft</span>
            <span class="nd-badge" data-variant="accent">New</span>
            <span class="nd-badge" data-variant="success">Paid</span>
            <span class="nd-badge" data-variant="warning">Pending</span>
            <span class="nd-badge" data-variant="danger">Overdue</span>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
