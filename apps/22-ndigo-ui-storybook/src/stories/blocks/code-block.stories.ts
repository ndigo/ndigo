/**
 * Blocks/Code Block — preformatted surface with a language label and a live
 * copy action.
 */
import { initCodeBlocks } from '@registry/blocks/code-block/code-block';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

interface CodeBlockArgs {
    /** Shown in the header; plain text, not syntax highlighting. */
    language: string;
    /** The exact text the copy button writes to the clipboard. */
    code: string;
}

const GREETING = 'export function greet(name: string) {\n    return `Hello, ${name}`;\n}';

const meta = {
    title: 'Blocks/Code Block',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('blocks/code-block') } },
    },
    argTypes: {
        language: { control: 'text' },
        code: { control: 'text' },
    },
    args: { language: 'TypeScript', code: GREETING },
    render: ({ language, code }) => html`
        <div class="nd-code-block" data-code-block>
            <div class="nd-code-block__header">
                <span class="nd-code-block__language">${language}</span>
                <button class="nd-button" data-variant="ghost" data-size="sm" type="button" data-copy>Copy</button>
            </div>
            <pre class="nd-code-block__pre" tabindex="0"><code class="nd-code-block__code">${code}</code></pre>
        </div>
    `,
} satisfies Meta<CodeBlockArgs>;

export default meta;
type Story = StoryObj<CodeBlockArgs>;

/** One block wired to the block's copy controller. */
export const Default: Story = {
    play: ({ canvasElement }) => {
        initCodeBlocks(canvasElement);
    },
};

/** Several blocks on one surface, each with its own copy action. */
export const Multiple: Story = {
    render: () => html`
        <div style="display: grid; gap: 1.5rem; max-inline-size: 44rem">
            <div class="nd-code-block" data-code-block>
                <div class="nd-code-block__header">
                    <span class="nd-code-block__language">TypeScript</span>
                    <button class="nd-button" data-variant="ghost" data-size="sm" type="button" data-copy>Copy</button>
                </div>
                <pre class="nd-code-block__pre" tabindex="0"><code class="nd-code-block__code">${GREETING}</code></pre>
            </div>
            <div class="nd-code-block" data-code-block>
                <div class="nd-code-block__header">
                    <span class="nd-code-block__language">HTML</span>
                    <button class="nd-button" data-variant="ghost" data-size="sm" type="button" data-copy>Copy</button>
                </div>
                <pre
                    class="nd-code-block__pre"
                    tabindex="0"
                ><code class="nd-code-block__code">${'<button class="nd-button" data-variant="primary">Save</button>'}</code></pre>
            </div>
        </div>
    `,
    play: ({ canvasElement }) => {
        initCodeBlocks(canvasElement);
    },
};
