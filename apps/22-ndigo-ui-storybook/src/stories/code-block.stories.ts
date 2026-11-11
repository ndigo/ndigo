/**
 * Storybook stories for the Ndigo UI code-block component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'Blocks/Code Block',
    tags: ['autodocs'],
    render: () =>
        html`<div class="nd-code-block" data-code-block>
            <div class="nd-code-block__header">
                <span class="nd-code-block__language">TypeScript</span>
                <button class="nd-button" data-variant="ghost" data-size="sm" type="button" data-copy>Copy</button>
            </div>
            <pre
                class="nd-code-block__pre"
                tabindex="0"
            ><code class="nd-code-block__code">const answer = 42;</code></pre>
        </div>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
