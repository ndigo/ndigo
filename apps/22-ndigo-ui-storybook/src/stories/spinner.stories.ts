/**
 * Storybook stories for the Ndigo UI spinner component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Spinner',
    tags: ['autodocs'],
    render: () =>
        html`<span class="nd-spinner" role="status" aria-label="Loading"></span>
            <span class="nd-spinner" data-size="sm" role="status" aria-label="Saving"></span>
            <span class="nd-spinner" data-size="lg" role="status" aria-label="Loading results"></span>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
