/**
 * Storybook stories for the Ndigo UI navigation-menu component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Navigation Menu',
    tags: ['autodocs'],
    render: () =>
        html`<nd-navigation-menu aria-label="Main">
            <ul data-part="list">
                <li data-part="item" data-value="products">
                    <button data-part="trigger" type="button">Products</button>
                    <div data-part="content">
                        <a data-part="link" href="/analytics">Analytics</a>
                        <a data-part="link" href="/marketing" aria-current="page">Marketing</a>
                    </div>
                </li>
                <li data-part="item" data-value="pricing">
                    <a data-part="link" href="/pricing">Pricing</a>
                </li>
            </ul>
        </nd-navigation-menu>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
