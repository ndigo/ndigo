/**
 * Storybook stories for the Ndigo UI toast component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Toast',
    tags: ['autodocs'],
    render: () =>
        html`<nd-toast type="success" duration="5000">
            <span data-part="title">Saved</span>
            <span data-part="description">Your changes are live.</span>
            <button data-part="close-trigger">Dismiss</button>
        </nd-toast>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
