/**
 * UI/Tags Input — removable chips inside a text control.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { readmeDescription } from '../../_readme';

interface TagsInputArgs {
    /** Initial tags, comma-separated. */
    value: string;
    name: string;
    /** Maximum number of tags; `0` means no limit. */
    max: number;
    delimiter: string;
    placeholder: string;
    /** Split pasted text into tags. */
    addOnPaste: boolean;
    /** `add` commits a typed tag on blur, `clear` drops it. */
    blurBehavior: 'add' | 'clear';
}

const meta = {
    title: 'UI/Tags Input',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/tags-input') } },
    },
    argTypes: {
        value: { control: 'text' },
        name: { control: 'text' },
        max: { control: { type: 'number', min: 0, step: 1 } },
        delimiter: { control: 'text' },
        placeholder: { control: 'text' },
        addOnPaste: { control: 'boolean' },
        blurBehavior: { control: 'select', options: ['add', 'clear'] },
    },
    args: {
        value: 'design, system',
        name: 'skills',
        max: 0,
        delimiter: ',',
        placeholder: 'Add a skill',
        addOnPaste: true,
        blurBehavior: 'add',
    },
    render: ({ value, name, max, delimiter, placeholder, addOnPaste, blurBehavior }) => html`
        <nd-tags-input
            name=${name}
            value=${value}
            delimiter=${delimiter}
            placeholder=${placeholder}
            blur-behavior=${blurBehavior}
            max=${max > 0 ? String(max) : nothing}
            style="max-inline-size: 24rem"
            ?add-on-paste=${addOnPaste}
        >
            <label data-part="label">Skills</label>
            <div data-part="control">
                <input data-part="input" placeholder=${placeholder} />
                <button data-part="clear-trigger" type="button" aria-label="Clear all tags">×</button>
            </div>
        </nd-tags-input>
    `,
} satisfies Meta<TagsInputArgs>;

export default meta;
type Story = StoryObj<TagsInputArgs>;

/** Two tags, with the clear action and the input available. */
export const Default: Story = {};

/** No tags yet, so only the placeholder shows. */
export const Empty: Story = {
    args: { value: '' },
};

/** The maximum reached: `max="2"` blocks a third tag. */
export const Maxed: Story = {
    args: { value: 'design, system', max: 2 },
};
