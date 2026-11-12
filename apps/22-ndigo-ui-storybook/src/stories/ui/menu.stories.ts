/**
 * UI/Menu — dropdown menu built on the Zag.js menu machine.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

interface MenuArgs {
    /** Controlled open state; reflected by the element. */
    open: boolean;
    triggerLabel: string;
}

const meta = {
    title: 'UI/Menu',
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: { description: { component: readmeDescription('ui/menu') } },
    },
    argTypes: {
        open: { control: 'boolean' },
        triggerLabel: { control: 'text' },
    },
    args: { open: false, triggerLabel: 'Actions' },
    render: ({ open, triggerLabel }) => html`
        <nd-menu trigger-label=${triggerLabel} ?open=${open}>
            <button data-part="trigger" type="button">Actions</button>
            <div data-part="content">
                <div data-part="item" data-value="edit">Edit</div>
                <div data-part="item" data-value="archive">Archive</div>
                <div data-part="separator"></div>
                <div data-part="item" data-value="delete">Delete</div>
            </div>
        </nd-menu>
    `,
} satisfies Meta<MenuArgs>;

export default meta;
type Story = StoryObj<MenuArgs>;

/** Closed, with the authored trigger. */
export const Default: Story = {};

/** Opened through the controlled `open` attribute. */
export const Open: Story = {
    args: { open: true },
};
