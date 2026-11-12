/**
 * UI/Combobox — filterable single-select built on the Zag.js combobox machine.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { readmeDescription } from '../../_readme';

interface ComboboxArgs {
    /** Form field name. */
    name: string;
    /** Initial input query (not the selected item). */
    value: string;
    /** Initial selected item value. */
    defaultValue: string;
    disabled: boolean;
    readonly: boolean;
    required: boolean;
    invalid: boolean;
}

const FRUIT = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'grape', label: 'Grape' },
];

const meta = {
    title: 'UI/Combobox',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/combobox') } },
    },
    argTypes: {
        name: { control: 'text' },
        value: { control: 'text', description: 'Initial input query, not the selected item.' },
        defaultValue: { control: 'select', options: ['', ...FRUIT.map((fruit) => fruit.value)] },
        disabled: { control: 'boolean' },
        readonly: { control: 'boolean' },
        required: { control: 'boolean' },
        invalid: { control: 'boolean' },
    },
    args: {
        name: 'fruit',
        value: '',
        defaultValue: '',
        disabled: false,
        readonly: false,
        required: false,
        invalid: false,
    },
    render: ({ name, value, defaultValue, disabled, readonly, required, invalid }) => html`
        <nd-combobox
            name=${name}
            value=${value}
            default-value=${defaultValue === '' ? nothing : defaultValue}
            style="max-inline-size: 20rem"
            ?disabled=${disabled}
            ?readonly=${readonly}
            ?required=${required}
            ?invalid=${invalid}
        >
            <label data-part="label">Fruit</label>
            <div data-part="control">
                <input data-part="input" placeholder="Search fruit" />
                <button data-part="trigger" type="button" aria-label="Show fruit">⌄</button>
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
        </nd-combobox>
    `,
} satisfies Meta<ComboboxArgs>;

export default meta;
type Story = StoryObj<ComboboxArgs>;

/** Closed, with the list filtered by typing once opened. */
export const Default: Story = {};

/** Opened through the element's `show()` method. */
export const Open: Story = {
    play: ({ canvasElement }) => {
        canvasElement.querySelector<HTMLElement & { show(): void }>('nd-combobox')?.show();
    },
};

/** A selected item, reflected in the input. */
export const Selected: Story = {
    args: { defaultValue: 'banana' },
};
