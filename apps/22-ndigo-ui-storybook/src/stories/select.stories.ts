/**
 * Storybook stories for the Ndigo UI select component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Select',
    tags: ['autodocs'],
    render: () =>
        html`<nd-select name="fruit" value="apple">
            <label data-part="label">Fruit</label>
            <div data-part="control">
                <button data-part="trigger" type="button">
                    <span data-part="value-text"></span>
                    <span data-part="indicator">v</span>
                </button>
                <button data-part="clear-trigger" type="button">Clear</button>
            </div>
            <div data-part="positioner">
                <div data-part="content">
                    <div data-part="item" data-value="apple">
                        <span data-part="item-text">Apple</span><span data-part="item-indicator">✓</span>
                    </div>
                    <div data-part="item" data-value="banana">
                        <span data-part="item-text">Banana</span><span data-part="item-indicator">✓</span>
                    </div>
                </div>
            </div>
        </nd-select>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
