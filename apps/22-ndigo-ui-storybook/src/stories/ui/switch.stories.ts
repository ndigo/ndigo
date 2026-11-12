/**
 * UI/Switch — accessible toggle built on the Zag.js switch machine.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

interface SwitchArgs {
    /** Controlled checked state; reflected by the element. */
    checked: boolean;
    disabled: boolean;
    readonly: boolean;
    label: string;
}

const meta = {
    title: 'UI/Switch',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/switch') } },
    },
    argTypes: {
        checked: { control: 'boolean' },
        disabled: { control: 'boolean' },
        readonly: { control: 'boolean' },
        label: { control: 'text' },
    },
    args: { checked: true, disabled: false, readonly: false, label: 'Notifications' },
    render: ({ checked, disabled, readonly, label }) => html`
        <nd-switch ?checked=${checked} ?disabled=${disabled} ?readonly=${readonly}>${label}</nd-switch>
    `,
} satisfies Meta<SwitchArgs>;

export default meta;
type Story = StoryObj<SwitchArgs>;

/** Checked, with the label as the element's text content. */
export const Default: Story = {};

/** The unchecked state. */
export const Off: Story = {
    args: { checked: false },
};

/** The disabled and read-only states. */
export const States: Story = {
    render: () => html`
        <div style="display: grid; gap: 1rem">
            <nd-switch disabled>Disabled</nd-switch>
            <nd-switch checked readonly>Read only</nd-switch>
        </div>
    `,
};
