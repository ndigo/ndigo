/**
 * Storybook stories for the Ndigo UI tags-input component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Tags Input',
    tags: ['autodocs'],
    render: () =>
        html`<nd-tags-input name="skills" value="design, system">
            <label data-part="label">Skills</label>
            <div data-part="control">
                <input data-part="input" placeholder="Add a skill" />
                <button data-part="clear-trigger" type="button">Clear</button>
            </div>
        </nd-tags-input>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
