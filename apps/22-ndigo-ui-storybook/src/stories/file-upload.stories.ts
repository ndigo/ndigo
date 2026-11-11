/**
 * Storybook stories for the Ndigo UI file-upload component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/File Upload',
    tags: ['autodocs'],
    render: () =>
        html`<nd-file-upload name="attachments" accept="image/*,.pdf" max-files="3">
            <label data-part="label">Attachments</label>
            <div data-part="dropzone">Drop files here or use the button below.</div>
            <button data-part="trigger" type="button">Choose files</button>
            <button data-part="clear-trigger" type="button">Clear</button>
        </nd-file-upload>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
