/**
 * Storybook stories for the Ndigo UI popover component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Popover',
    tags: ['autodocs'],
    render: () =>
        html`<nd-popover>
            <button data-part="trigger">Open settings</button>
            <div data-part="positioner">
                <div data-part="content">
                    <h2 data-part="title">Settings</h2>
                    <p data-part="description">Adjust the workspace.</p>
                    <button data-part="close-trigger">Close</button>
                </div>
            </div>
        </nd-popover>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
