/**
 * UI/Dialog — accessible modal built on the Zag.js dialog machine.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { readmeDescription } from '../../_readme';

interface DialogArgs {
    /** Controlled open state; reflected by the element. */
    open: boolean;
    /** Label used when the element has to generate a trigger. */
    triggerLabel: string;
    /** Selector for the element focused when the dialog opens. */
    initialFocus: string;
}

const meta = {
    title: 'UI/Dialog',
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: { description: { component: readmeDescription('ui/dialog') } },
    },
    argTypes: {
        open: { control: 'boolean' },
        triggerLabel: { control: 'text' },
        initialFocus: { control: 'text' },
    },
    args: { open: false, triggerLabel: 'Open dialog', initialFocus: '' },
    render: ({ open, triggerLabel, initialFocus }) => html`
        <nd-dialog
            trigger-label=${triggerLabel}
            initial-focus=${initialFocus === '' ? nothing : initialFocus}
            ?open=${open}
        >
            <button data-part="trigger" type="button">Invite teammate</button>
            <div data-part="content">
                <h2 data-part="title">Invite teammate</h2>
                <p data-part="description">They will receive an email invitation.</p>
                <button data-part="close-trigger" type="button">Close</button>
                <div class="nd-field" style="margin-block-start: 1rem">
                    <label class="nd-label" for="dialog-email">Email</label>
                    <input class="nd-input" id="dialog-email" name="email" type="email" />
                </div>
            </div>
        </nd-dialog>
    `,
} satisfies Meta<DialogArgs>;

export default meta;
type Story = StoryObj<DialogArgs>;

/** Closed on load, with the authored trigger. */
export const Default: Story = {};

/** Opened through the controlled `open` attribute. */
export const Open: Story = {
    args: { open: true },
};

/** Focus lands on the email input instead of Zag's first-focusable default. */
export const InitialFocus: Story = {
    args: { open: true, initialFocus: '#dialog-email' },
};
