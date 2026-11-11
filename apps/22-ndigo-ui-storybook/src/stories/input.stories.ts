/**
 * Storybook stories for the Ndigo UI input component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Input',
    tags: ['autodocs'],
    render: () =>
        html`<label class="nd-label" for="name">Name</label>
            <input class="nd-input" id="name" name="name" autocomplete="name" />

            <label class="nd-label" for="notes">Notes</label>
            <textarea class="nd-textarea" id="notes" name="notes"></textarea>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
