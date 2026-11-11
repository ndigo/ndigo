/**
 * Storybook stories for the Ndigo UI checkbox component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Checkbox',
    tags: ['autodocs'],
    render: () =>
        html`<label class="nd-choice">
                <input class="nd-checkbox" type="checkbox" name="updates" checked />
                <span class="nd-label">Product updates</span>
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
            </fieldset>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
