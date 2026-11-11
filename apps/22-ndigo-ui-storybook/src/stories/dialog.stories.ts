/**
 * Storybook stories for the Ndigo UI dialog component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Dialog',
    tags: ['autodocs'],
    render: () =>
        html`<nd-dialog>
            <button data-part="trigger">Invite teammate</button>
            <div data-part="content">
                <h2 data-part="title">Invite teammate</h2>
                <p data-part="description">They will receive an email invitation.</p>
                <button data-part="close-trigger">Close</button>
                <p>Your own body content goes here.</p>
            </div>
        </nd-dialog>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
