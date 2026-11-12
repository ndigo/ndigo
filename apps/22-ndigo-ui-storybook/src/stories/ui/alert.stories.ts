/**
 * UI/Alert — inline status message in the four semantic variants.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

interface AlertArgs {
    /** Semantic tone; `info` is the default. */
    variant: AlertVariant;
    title: string;
    description: string;
    /** Urgent messages use `alert`; everything else uses `status`. */
    urgent: boolean;
}

const ICONS: Record<AlertVariant, string> = {
    info: 'ℹ',
    success: '✓',
    warning: '!',
    danger: '×',
};

const meta = {
    title: 'UI/Alert',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/alert') } },
    },
    argTypes: {
        variant: { control: 'select', options: ['info', 'success', 'warning', 'danger'] },
        title: { control: 'text' },
        description: { control: 'text' },
        urgent: { control: 'boolean', description: 'Use `role="alert"` instead of `role="status"`.' },
    },
    args: { variant: 'success', title: 'Saved', description: 'The invoice was updated.', urgent: false },
    render: ({ variant, title, description, urgent }) => html`
        <div class="nd-alert" data-variant=${variant} role=${urgent ? 'alert' : 'status'}>
            <span class="nd-alert__icon" aria-hidden="true">${ICONS[variant]}</span>
            <div class="nd-alert__content">
                <p class="nd-alert__title">${title}</p>
                <p class="nd-alert__description">${description}</p>
            </div>
        </div>
    `,
} satisfies Meta<AlertArgs>;

export default meta;
type Story = StoryObj<AlertArgs>;

/** The default success message. */
export const Default: Story = {};

/** All four documented variants, in contract order. */
export const Variants: Story = {
    render: () => html`
        <div style="display: grid; gap: 1rem; max-inline-size: 40rem">
            ${(['info', 'success', 'warning', 'danger'] as const).map(
                (variant) =>
                    html`<div class="nd-alert" data-variant=${variant} role="status">
                        <span class="nd-alert__icon" aria-hidden="true">${ICONS[variant]}</span>
                        <div class="nd-alert__content">
                            <p class="nd-alert__title">${variant}</p>
                            <p class="nd-alert__description">The ${variant} tone, on the semantic token.</p>
                        </div>
                    </div>`
            )}
        </div>
    `,
};
