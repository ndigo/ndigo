/**
 * Storybook stories for the Ndigo UI command component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'Blocks/Command',
    tags: ['autodocs'],
    render: () =>
        html`<div class="nd-command" data-command>
            <nd-dialog initial-focus="[data-part='input']">…</nd-dialog>
        </div>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
