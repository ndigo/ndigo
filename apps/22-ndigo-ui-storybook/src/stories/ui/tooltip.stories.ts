/**
 * UI/Tooltip — hint surface built on the Zag.js tooltip machine.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

interface TooltipArgs {
    /** Initial open state; `onOpenChange` reflects it. */
    open: boolean;
    openDelay: number;
    closeDelay: number;
    triggerLabel: string;
}

const meta = {
    title: 'UI/Tooltip',
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: { description: { component: readmeDescription('ui/tooltip') } },
    },
    argTypes: {
        open: { control: 'boolean' },
        openDelay: { control: 'number' },
        closeDelay: { control: 'number' },
        triggerLabel: { control: 'text' },
    },
    args: { open: false, openDelay: 200, closeDelay: 100, triggerLabel: 'Info' },
    render: ({ open, openDelay, closeDelay, triggerLabel }) => html`
        <nd-tooltip
            open-delay=${String(openDelay)}
            close-delay=${String(closeDelay)}
            trigger-label=${triggerLabel}
            ?open=${open}
        >
            <button data-part="trigger" type="button">Info</button>
            <div data-part="positioner">
                <div data-part="content">The shortcut is Ctrl+K.</div>
            </div>
        </nd-tooltip>
    `,
} satisfies Meta<TooltipArgs>;

export default meta;
type Story = StoryObj<TooltipArgs>;

/** Closed until the pointer rests on the trigger. */
export const Default: Story = {};

/** The hint visible on load, for documentation screenshots. */
export const Open: Story = {
    args: { open: true },
};
