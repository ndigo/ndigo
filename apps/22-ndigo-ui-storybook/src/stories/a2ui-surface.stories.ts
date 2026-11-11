/**
 * Storybook stories for the Ndigo UI a2ui-surface component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/A2ui Surface',
    tags: ['autodocs'],
    render: () => html`<nd-a2ui-surface></nd-a2ui-surface>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
