/**
 * UI/Accordion — disclosure stack built on the Zag.js accordion machine.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

interface AccordionArgs {
    /** Comma-separated item values that start open. */
    value: string;
    /** Allow more than one open item. */
    multiple: boolean;
    /** Allow the open item to close again. */
    collapsible: boolean;
}

const ITEMS = [
    { value: 'shipping', label: 'Shipping', body: 'Ships in two days.' },
    { value: 'returns', label: 'Returns', body: 'Thirty-day returns.' },
    { value: 'support', label: 'Support', body: 'Answers within one business day.' },
];

const meta = {
    title: 'UI/Accordion',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/accordion') } },
    },
    argTypes: {
        value: { control: 'text', description: 'Comma-separated initial open values.' },
        multiple: { control: 'boolean' },
        collapsible: { control: 'boolean' },
    },
    args: { value: 'shipping', multiple: false, collapsible: true },
    render: ({ value, multiple, collapsible }) => html`
        <nd-accordion value=${value} style="max-inline-size: 32rem" ?multiple=${multiple} ?collapsible=${collapsible}>
            ${ITEMS.map(
                (item) =>
                    html`<div data-part="item" data-value=${item.value}>
                        <button data-part="item-trigger" data-value=${item.value}>
                            ${item.label} <span data-part="item-indicator">+</span>
                        </button>
                        <div data-part="item-content" data-value=${item.value}>${item.body}</div>
                    </div>`
            )}
        </nd-accordion>
    `,
} satisfies Meta<AccordionArgs>;

export default meta;
type Story = StoryObj<AccordionArgs>;

/** One item open, collapsible by click. */
export const Default: Story = {};

/** Two items open at once; `multiple` allows that. */
export const Multiple: Story = {
    args: { value: 'shipping,returns', multiple: true },
};

/** A single-open accordion that cannot close the open item. */
export const Required: Story = {
    args: { collapsible: false },
};
