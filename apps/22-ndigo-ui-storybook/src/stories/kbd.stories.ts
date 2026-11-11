/**
 * Storybook stories for the Ndigo UI kbd component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Kbd',
    tags: ['autodocs'],
    render: () =>
        html`<p>Press <kbd class="nd-kbd">Ctrl</kbd> + <kbd class="nd-kbd">K</kbd> to search.</p>

            <span class="nd-kbd-group">
                <kbd class="nd-kbd">⌘</kbd>
                <kbd class="nd-kbd">K</kbd>
            </span>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
