/**
 * UI/File Upload — dropzone and accepted-file list built on Zag.js.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

interface FileUploadArgs {
    name: string;
    /** Comma-separated MIME types/extensions. */
    accept: string;
    /** Maximum number of files (default `1`). */
    maxFiles: number;
    disabled: boolean;
    readonly: boolean;
    required: boolean;
    invalid: boolean;
}

const meta = {
    title: 'UI/File Upload',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/file-upload') } },
    },
    argTypes: {
        name: { control: 'text' },
        accept: { control: 'text' },
        maxFiles: { control: { type: 'number', min: 1, step: 1 } },
        disabled: { control: 'boolean' },
        readonly: { control: 'boolean' },
        required: { control: 'boolean' },
        invalid: { control: 'boolean' },
    },
    args: {
        name: 'attachments',
        accept: 'image/*,.pdf',
        maxFiles: 3,
        disabled: false,
        readonly: false,
        required: false,
        invalid: false,
    },
    render: ({ name, accept, maxFiles, disabled, readonly, required, invalid }) => html`
        <nd-file-upload
            name=${name}
            accept=${accept}
            max-files=${String(maxFiles)}
            style="max-inline-size: 28rem"
            ?disabled=${disabled}
            ?readonly=${readonly}
            ?required=${required}
            ?invalid=${invalid}
        >
            <label data-part="label">Attachments</label>
            <div data-part="dropzone">Drop files here or use the button below.</div>
            <button data-part="trigger" type="button">Choose files</button>
            <button data-part="clear-trigger" type="button" aria-label="Clear files">×</button>
        </nd-file-upload>
    `,
} satisfies Meta<FileUploadArgs>;

export default meta;
type Story = StoryObj<FileUploadArgs>;

/** The dropzone with a three-file limit. */
export const Default: Story = {};

/** The disabled state, where the dropzone and trigger are inert. */
export const Disabled: Story = {
    args: { disabled: true },
};

/** An invalid dropzone for an accepted-types error. */
export const Invalid: Story = {
    args: { invalid: true, accept: 'image/*' },
};
