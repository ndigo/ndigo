/**
 * UI/Spinner — rotating loading indicator in three sizes.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { readmeDescription } from '../../_readme';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerArgs {
    /** `md` is the default and omits the attribute. */
    size: SpinnerSize;
    /** Accessible name for the live status. */
    label: string;
}

const SIZES: SpinnerSize[] = ['sm', 'md', 'lg'];

const meta = {
    title: 'UI/Spinner',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/spinner') } },
    },
    argTypes: {
        size: { control: 'select', options: SIZES },
        label: { control: 'text' },
    },
    args: { size: 'md', label: 'Loading' },
    render: ({ size, label }) => html`
        <span class="nd-spinner" data-size=${size === 'md' ? nothing : size} role="status" aria-label=${label}></span>
    `,
} satisfies Meta<SpinnerArgs>;

export default meta;
type Story = StoryObj<SpinnerArgs>;

/** The default size with an accessible name. */
export const Default: Story = {};

/** All three documented sizes. */
export const Sizes: Story = {
    render: () => html`
        <div style="display: flex; align-items: center; gap: 1.5rem">
            ${SIZES.map(
                (size) =>
                    html`<span
                        class="nd-spinner"
                        data-size=${size === 'md' ? nothing : size}
                        role="status"
                        aria-label=${`${size} spinner`}
                    ></span>`
            )}
        </div>
    `,
};

/** A spinner paired with visible text inside its own live region. */
export const WithLabel: Story = {
    render: () => html`
        <p class="nd-row" role="status" style="display: flex; align-items: center; gap: 0.5rem">
            <span class="nd-spinner" data-size="sm" aria-hidden="true"></span>
            Loading invoices…
        </p>
    `,
};
