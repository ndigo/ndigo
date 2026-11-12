/**
 * UI/Button — native button styles in every documented variant and size.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonArgs {
    /** Visual weight; `primary` is the call to action. */
    variant: ButtonVariant;
    /** Control height; `md` is the default. */
    size: ButtonSize;
    disabled: boolean;
    label: string;
}

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger'];
const SIZES: ButtonSize[] = ['sm', 'md', 'lg'];

const attributes = (variant: ButtonVariant, size: ButtonSize) => {
    const map: Record<string, string> = {};
    if (variant !== 'primary') map['data-variant'] = variant;
    if (size !== 'md') map['data-size'] = size;
    return map;
};

const meta = {
    title: 'UI/Button',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/button') } },
    },
    argTypes: {
        variant: { control: 'select', options: VARIANTS },
        size: { control: 'select', options: SIZES },
        disabled: { control: 'boolean' },
        label: { control: 'text' },
    },
    args: { variant: 'primary', size: 'md', disabled: false, label: 'Save' },
    render: ({ variant, size, disabled, label }) => html`
        <button class="nd-button" ...=${attributes(variant, size)} ?disabled=${disabled} type="button">${label}</button>
    `,
} satisfies Meta<ButtonArgs>;

export default meta;
type Story = StoryObj<ButtonArgs>;

/** The primary call to action. */
export const Default: Story = {};

/** The four documented variants. */
export const Variants: Story = {
    render: () => html`
        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center">
            ${VARIANTS.map(
                (variant) =>
                    html`<button class="nd-button" ...=${attributes(variant, 'md')} type="button">${variant}</button>`
            )}
        </div>
    `,
};

/** The three documented sizes, each at the default weight. */
export const Sizes: Story = {
    render: () => html`
        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center">
            ${SIZES.map(
                (size) =>
                    html`<button class="nd-button" ...=${attributes('primary', size)} type="button">${size}</button>`
            )}
        </div>
    `,
};

/** Every variant in the disabled state. */
export const Disabled: Story = {
    render: () => html`
        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center">
            ${VARIANTS.map(
                (variant) =>
                    html`<button class="nd-button" ...=${attributes(variant, 'md')} disabled type="button">
                        ${variant}
                    </button>`
            )}
        </div>
    `,
};
