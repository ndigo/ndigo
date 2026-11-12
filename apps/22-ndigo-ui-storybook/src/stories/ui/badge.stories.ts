/**
 * UI/Badge — compact status label in the six documented tones.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { readmeDescription } from '../../_readme';

type BadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeArgs {
    /** `neutral` is the default (no attribute). */
    variant: BadgeVariant;
    label: string;
}

const VARIANTS: BadgeVariant[] = ['neutral', 'accent', 'success', 'warning', 'danger', 'info'];

const meta = {
    title: 'UI/Badge',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/badge') } },
    },
    argTypes: {
        variant: { control: 'select', options: VARIANTS },
        label: { control: 'text' },
    },
    args: { variant: 'neutral', label: 'Draft' },
    render: ({ variant, label }) => html`
        <span class="nd-badge" data-variant=${variant === 'neutral' ? nothing : variant}>${label}</span>
    `,
} satisfies Meta<BadgeArgs>;

export default meta;
type Story = StoryObj<BadgeArgs>;

/** The default neutral badge. */
export const Default: Story = {};

/** Every documented variant, including the default neutral. */
export const Variants: Story = {
    render: () => html`
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem">
            ${VARIANTS.map(
                (variant) =>
                    html`<span class="nd-badge" data-variant=${variant === 'neutral' ? nothing : variant}>
                        ${variant === 'neutral' ? 'Draft' : variant}
                    </span>`
            )}
        </div>
    `,
};
