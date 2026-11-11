/**
 * Storybook stories for the Ndigo UI date-picker component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Date Picker',
    tags: ['autodocs'],
    render: () =>
        html`<nd-date-picker name="start" value="2026-11-09">
            <label data-part="label">Start date</label>
            <div data-part="control">
                <input data-part="input" placeholder="Pick a date" />
                <button data-part="trigger" type="button" aria-label="Open calendar">v</button>
                <button data-part="clear-trigger" type="button">Clear</button>
            </div>
            <div data-part="positioner">
                <div data-part="content">
                    <div data-part="view-control">
                        <button data-part="prev-trigger" type="button">‹</button>
                        <span data-part="view-label"></span>
                        <button data-part="next-trigger" type="button">›</button>
                    </div>
                </div>
            </div>
        </nd-date-picker>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
