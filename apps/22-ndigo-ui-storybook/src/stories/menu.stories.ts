/**
 * Storybook stories for the Ndigo UI menu component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Menu',
    tags: ['autodocs'],
    render: () =>
        html`<nd-menu>
            <button data-part="trigger">Actions</button>
            <div data-part="content">
                <div data-part="item" data-value="edit">Edit</div>
                <div data-part="item" data-value="archive">Archive</div>
                <div data-part="separator"></div>
                <div data-part="item" data-value="delete">Delete</div>
            </div>
        </nd-menu>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
