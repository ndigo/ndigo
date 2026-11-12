/**
 * UI/Checkbox — native checkboxes and radios styled by the choice classes.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

interface CheckboxArgs {
    checked: boolean;
    disabled: boolean;
    label: string;
}

const meta = {
    title: 'UI/Checkbox',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/checkbox') } },
    },
    argTypes: {
        checked: { control: 'boolean' },
        disabled: { control: 'boolean' },
        label: { control: 'text' },
    },
    args: { checked: true, disabled: false, label: 'Product updates' },
    render: ({ checked, disabled, label }) => html`
        <div style="display: grid; gap: 1.5rem">
            <label class="nd-choice">
                <input class="nd-checkbox" type="checkbox" name="updates" ?checked=${checked} ?disabled=${disabled} />
                <span class="nd-label">${label}</span>
            </label>

            <fieldset class="nd-choice-group">
                <legend class="nd-label">Plan</legend>
                <label class="nd-choice">
                    <input class="nd-radio" type="radio" name="plan" value="free" checked />
                    <span class="nd-label">Free</span>
                </label>
                <label class="nd-choice">
                    <input class="nd-radio" type="radio" name="plan" value="pro" />
                    <span class="nd-label">Pro</span>
                </label>
            </fieldset>
        </div>
    `,
} satisfies Meta<CheckboxArgs>;

export default meta;
type Story = StoryObj<CheckboxArgs>;

/** A checked checkbox and a native radio group. */
export const Default: Story = {};

/** The unchecked and disabled states. */
export const States: Story = {
    render: () => html`
        <div style="display: grid; gap: 1rem">
            <label class="nd-choice">
                <input class="nd-checkbox" type="checkbox" name="a" />
                <span class="nd-label">Unchecked</span>
            </label>
            <label class="nd-choice">
                <input class="nd-checkbox" type="checkbox" name="b" checked />
                <span class="nd-label">Checked</span>
            </label>
            <label class="nd-choice">
                <input class="nd-checkbox" type="checkbox" name="c" disabled />
                <span class="nd-label">Disabled</span>
            </label>
            <label class="nd-choice">
                <input class="nd-checkbox" type="checkbox" name="d" checked disabled />
                <span class="nd-label">Checked and disabled</span>
            </label>
        </div>
    `,
};
