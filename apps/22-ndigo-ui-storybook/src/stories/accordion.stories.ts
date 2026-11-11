/**
 * Storybook stories for the Ndigo UI accordion component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Accordion',
    tags: ['autodocs'],
    render: () =>
        html`<nd-accordion collapsible>
            <div data-part="item" data-value="shipping">
                <button data-part="item-trigger" data-value="shipping">
                    Shipping <span data-part="item-indicator">+</span>
                </button>
                <div data-part="item-content" data-value="shipping">Ships in two days.</div>
            </div>
            <div data-part="item" data-value="returns">
                <button data-part="item-trigger" data-value="returns">
                    Returns <span data-part="item-indicator">+</span>
                </button>
                <div data-part="item-content" data-value="returns">Thirty-day returns.</div>
            </div>
        </nd-accordion>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
