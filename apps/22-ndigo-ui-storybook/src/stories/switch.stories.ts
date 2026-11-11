/**
 * Storybook stories for the Ndigo UI switch component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Switch',
    tags: ['autodocs'],
    render: () => html`<nd-switch checked>Notifications</nd-switch>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
