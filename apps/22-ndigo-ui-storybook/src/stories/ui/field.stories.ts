/**
 * UI/Field — label, help, and error scaffolding for native controls.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { readmeDescription } from '../../_readme';

interface FieldArgs {
    /** Adds the `data-required` marker to the label. */
    required: boolean;
    /** Puts the input in the invalid state and shows the error line. */
    invalid: boolean;
    /** Shows the help line under the control. */
    help: boolean;
    label: string;
}

const meta = {
    title: 'UI/Field',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/field') } },
    },
    argTypes: {
        required: { control: 'boolean' },
        invalid: { control: 'boolean' },
        help: { control: 'boolean' },
        label: { control: 'text' },
    },
    args: { required: true, invalid: false, help: true, label: 'Email' },
    render: ({ required, invalid, help, label }) => html`
        <div class="nd-field" style="max-inline-size: 24rem">
            <label class="nd-label" for="field-email" ?data-required=${required}>${label}</label>
            <input
                class="nd-input"
                id="field-email"
                name="email"
                type="email"
                aria-describedby=${
                    !invalid && !help ? nothing : ['field-help', invalid ? 'field-error' : ''].filter(Boolean).join(' ')
                }
                aria-invalid=${invalid ? 'true' : nothing}
            />
            ${help ? html`<p class="nd-help" id="field-help">We only use this for account notices.</p>` : nothing}
            ${invalid ? html`<p class="nd-error" id="field-error">Enter a valid email address.</p>` : nothing}
        </div>
    `,
} satisfies Meta<FieldArgs>;

export default meta;
type Story = StoryObj<FieldArgs>;

/** A required field with a help line. */
export const Default: Story = {};

/** The invalid state pairs the error line with `aria-invalid`. */
export const Invalid: Story = {
    args: { invalid: true, help: false },
};
