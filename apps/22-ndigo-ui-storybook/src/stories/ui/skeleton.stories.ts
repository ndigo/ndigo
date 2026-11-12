/**
 * UI/Skeleton — loading placeholders for text, avatars, and blocks.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

const meta = {
    title: 'UI/Skeleton',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/skeleton') } },
    },
    render: () => html`
        <div aria-hidden="true" style="display: grid; gap: 0.75rem; max-inline-size: 24rem">
            <span class="nd-skeleton" data-shape="text" style="inline-size: 60%"></span>
            <span class="nd-skeleton" data-shape="text" style="inline-size: 40%"></span>
            <span class="nd-skeleton" data-shape="circle" style="inline-size: 3rem; block-size: 3rem"></span>
            <span class="nd-skeleton" data-shape="rect" style="block-size: 6rem"></span>
        </div>
    `,
} satisfies Meta;

export default meta;
type Story = StoryObj;

/** Text lines, a circle, and a rectangle, hidden from assistive technology. */
export const Default: Story = {};
