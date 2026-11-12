/**
 * UI/Input — native single-line and multi-line text controls.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { readmeDescription } from '../../_readme';

interface InputArgs {
    placeholder: string;
    /** Applies the invalid styling and `aria-invalid`. */
    invalid: boolean;
    disabled: boolean;
    readonly: boolean;
}

const meta = {
    title: 'UI/Input',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/input') } },
    },
    argTypes: {
        placeholder: { control: 'text' },
        invalid: { control: 'boolean' },
        disabled: { control: 'boolean' },
        readonly: { control: 'boolean' },
    },
    args: { placeholder: 'Ada Lovelace', invalid: false, disabled: false, readonly: false },
    render: ({ placeholder, invalid, disabled, readonly }) => html`
        <div style="display: grid; gap: 1.25rem; max-inline-size: 24rem">
            <div class="nd-field">
                <label class="nd-label" for="input-name">Name</label>
                <input
                    class="nd-input"
                    id="input-name"
                    name="name"
                    autocomplete="name"
                    placeholder=${placeholder}
                    aria-invalid=${invalid ? 'true' : nothing}
                    ?disabled=${disabled}
                    ?readonly=${readonly}
                />
            </div>

            <div class="nd-field">
                <label class="nd-label" for="input-notes">Notes</label>
                <textarea
                    class="nd-textarea"
                    id="input-notes"
                    name="notes"
                    placeholder="Anything we should know?"
                    ?aria-invalid=${invalid}
                    ?disabled=${disabled}
                    ?readonly=${readonly}
                ></textarea>
            </div>
        </div>
    `,
} satisfies Meta<InputArgs>;

export default meta;
type Story = StoryObj<InputArgs>;

/** An input paired with a textarea, both on the native control. */
export const Default: Story = {};

/** The disabled, readonly, and invalid states. */
export const States: Story = {
    render: () => html`
        <div style="display: grid; gap: 1.25rem; max-inline-size: 24rem">
            <div class="nd-field">
                <label class="nd-label" for="input-disabled">Disabled</label>
                <input class="nd-input" id="input-disabled" value="Read only" disabled />
            </div>
            <div class="nd-field">
                <label class="nd-label" for="input-readonly">Read only</label>
                <input class="nd-input" id="input-readonly" value="Read only" readonly />
            </div>
            <div class="nd-field">
                <label class="nd-label" for="input-invalid">Invalid</label>
                <input class="nd-input" id="input-invalid" value="not-an-email" aria-invalid="true" />
                <p class="nd-error">Enter a valid email address.</p>
            </div>
        </div>
    `,
};
