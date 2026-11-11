/**
 * Storybook stories for the Ndigo UI skeleton component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Skeleton',
    tags: ['autodocs'],
    render: () =>
        html`<div aria-hidden="true">
            <span class="nd-skeleton" data-shape="text" style="inline-size: 60%"></span>
            <span class="nd-skeleton" data-shape="text" style="inline-size: 40%"></span>
            <span class="nd-skeleton" data-shape="circle"></span>
            <span class="nd-skeleton" data-shape="rect"></span>
        </div>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
