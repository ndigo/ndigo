/**
 * UI/Popover — non-modal overlay built on the Zag.js popover machine.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

interface PopoverArgs {
    /** Controlled open state; reflected by the element. */
    open: boolean;
    triggerLabel: string;
}

const meta = {
    title: 'UI/Popover',
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: { description: { component: readmeDescription('ui/popover') } },
    },
    argTypes: {
        open: { control: 'boolean' },
        triggerLabel: { control: 'text' },
    },
    args: { open: false, triggerLabel: 'Open settings' },
    render: ({ open, triggerLabel }) => html`
        <nd-popover trigger-label=${triggerLabel} ?open=${open}>
            <button data-part="trigger" type="button">Open settings</button>
            <div data-part="positioner">
                <div data-part="content">
                    <h2 data-part="title">Settings</h2>
                    <p data-part="description">Adjust the workspace.</p>
                    <button data-part="close-trigger" type="button">Close</button>
                </div>
            </div>
        </nd-popover>
    `,
} satisfies Meta<PopoverArgs>;

export default meta;
type Story = StoryObj<PopoverArgs>;

/** Closed, with the authored trigger. */
export const Default: Story = {};

/** Opened through the controlled `open` attribute. */
export const Open: Story = {
    args: { open: true },
};
