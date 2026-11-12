/**
 * UI/Select — single-select dropdown built on the Zag.js select machine.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { readmeDescription } from '../../_readme';

interface SelectArgs {
    /** Initial selected value. */
    value: string;
    name: string;
    /** Value text when nothing is selected. */
    placeholder: string;
    disabled: boolean;
    readonly: boolean;
    required: boolean;
    invalid: boolean;
}

const FRUIT = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
];

const meta = {
    title: 'UI/Select',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/select') } },
    },
    argTypes: {
        value: { control: 'select', options: ['', ...FRUIT.map((fruit) => fruit.value)] },
        name: { control: 'text' },
        placeholder: { control: 'text' },
        disabled: { control: 'boolean' },
        readonly: { control: 'boolean' },
        required: { control: 'boolean' },
        invalid: { control: 'boolean' },
    },
    args: {
        value: 'apple',
        name: 'fruit',
        placeholder: 'Pick a fruit',
        disabled: false,
        readonly: false,
        required: false,
        invalid: false,
    },
    render: ({ value, name, placeholder, disabled, readonly, required, invalid }) => html`
        <nd-select
            name=${name}
            placeholder=${placeholder}
            value=${value === '' ? nothing : value}
            style="max-inline-size: 20rem"
            ?disabled=${disabled}
            ?readonly=${readonly}
            ?required=${required}
            ?invalid=${invalid}
        >
            <label data-part="label">Fruit</label>
            <div data-part="control">
                <button data-part="trigger" type="button">
                    <span data-part="value-text"></span>
                    <span data-part="indicator" aria-hidden="true">⌄</span>
                </button>
                <button data-part="clear-trigger" type="button" aria-label="Clear fruit">×</button>
            </div>
            <div data-part="positioner">
                <div data-part="content">
                    ${FRUIT.map(
                        (fruit) =>
                            html`<div data-part="item" data-value=${fruit.value}>
                                <span data-part="item-text">${fruit.label}</span>
                                <span data-part="item-indicator" aria-hidden="true">✓</span>
                            </div>`
                    )}
                </div>
            </div>
        </nd-select>
    `,
} satisfies Meta<SelectArgs>;

export default meta;
type Story = StoryObj<SelectArgs>;

/** Apple selected, with the clear action available. */
export const Default: Story = {};

/** The placeholder shown when nothing is selected. */
export const Placeholder: Story = {
    args: { value: '' },
};
