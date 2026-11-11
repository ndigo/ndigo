/**
 * Storybook stories for the Ndigo UI tabs component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Tabs',
    tags: ['autodocs'],
    render: () =>
        html`<nd-tabs value="overview">
            <div data-part="root">
                <div data-part="list">
                    <button data-part="trigger" data-value="overview">Overview</button>
                    <button data-part="trigger" data-value="install">Install</button>
                </div>
                <div data-part="content" data-value="overview">Overview panel</div>
                <div data-part="content" data-value="install">Install panel</div>
            </div>
        </nd-tabs>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
