/**
 * UI/Aspect Ratio — fixed-ratio media frames.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';
import { PLACEHOLDER_IMAGE } from '../_placeholder';

interface AspectRatioArgs {
    /** Any CSS `aspect-ratio` value; 16 / 9 is the default. */
    ratio: string;
    /** Alternative text for the placeholder image. */
    alt: string;
}

const meta = {
    title: 'UI/Aspect Ratio',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/aspect-ratio') } },
    },
    argTypes: {
        ratio: { control: 'text', description: 'Set through `--nd-aspect-ratio`.' },
        alt: { control: 'text' },
    },
    args: { ratio: '16 / 9', alt: 'Team photo' },
    render: ({ ratio, alt }) => html`
        <div class="nd-aspect" style="--nd-aspect-ratio: ${ratio}; max-inline-size: 36rem">
            <img src=${PLACEHOLDER_IMAGE} alt=${alt} />
        </div>
    `,
} satisfies Meta<AspectRatioArgs>;

export default meta;
type Story = StoryObj<AspectRatioArgs>;

/** The default 16 / 9 frame, reserving space before the image loads. */
export const Default: Story = {};

/** Square and portrait frames, using the same custom property. */
export const Ratios: Story = {
    render: () => html`
        <div style="display: flex; flex-wrap: wrap; gap: 1.5rem; align-items: start">
            ${[
                { ratio: '16 / 9', label: '16 / 9' },
                { ratio: '1', label: '1 / 1' },
                { ratio: '4 / 5', label: '4 / 5' },
            ].map(
                ({ ratio, label }) =>
                    html`<figure style="margin: 0; inline-size: 14rem">
                        <div class="nd-aspect" style="--nd-aspect-ratio: ${ratio}">
                            <img src=${PLACEHOLDER_IMAGE} alt=${`${label} placeholder`} />
                        </div>
                        <figcaption style="margin-block-start: 0.5rem; color: var(--nd-color-text-muted)">
                            ${label}
                        </figcaption>
                    </figure>`
            )}
        </div>
    `,
};
