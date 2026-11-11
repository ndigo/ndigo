/**
 * Storybook stories for the Ndigo UI button component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Button',
    tags: ['autodocs'],
    render: () =>
        html`<button class="nd-button" data-variant="primary">Save</button>
            <button class="nd-button">Cancel</button>
            <button class="nd-button" data-variant="ghost" data-size="sm">Skip</button>
            <button class="nd-button" data-variant="danger">Delete</button>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
