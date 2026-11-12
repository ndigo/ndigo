/**
 * UI/Drawer — edge-anchored dialog built on the Zag.js dialog machine.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

type DrawerPlacement = 'end' | 'start' | 'bottom' | 'top';

interface DrawerArgs {
    /** Edge the panel is anchored to; invalid values fall back to `end`. */
    placement: DrawerPlacement;
    /** Controlled open state; reflected by the element. */
    open: boolean;
    triggerLabel: string;
}

const meta = {
    title: 'UI/Drawer',
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: { description: { component: readmeDescription('ui/drawer') } },
    },
    argTypes: {
        placement: { control: 'select', options: ['end', 'start', 'bottom', 'top'] },
        open: { control: 'boolean' },
        triggerLabel: { control: 'text' },
    },
    args: { placement: 'end', open: false, triggerLabel: 'Open drawer' },
    render: ({ placement, open, triggerLabel }) => html`
        <div style="padding: 2rem">
            <nd-drawer placement=${placement} trigger-label=${triggerLabel} ?open=${open}>
                <button data-part="trigger" type="button">Open drawer</button>
                <div data-part="content">
                    <h2 data-part="title">Filters</h2>
                    <p data-part="description">Narrow the list without leaving the page.</p>
                    <button data-part="close-trigger" type="button">Close</button>
                    <p>Your content goes here.</p>
                </div>
            </nd-drawer>
        </div>
    `,
} satisfies Meta<DrawerArgs>;

export default meta;
type Story = StoryObj<DrawerArgs>;

/** The default end placement, closed. */
export const Default: Story = {};

/** The panel open on the end edge. */
export const Open: Story = {
    args: { open: true },
};

/** The bottom placement, for short action sheets. */
export const Bottom: Story = {
    args: { placement: 'bottom', open: true },
};
