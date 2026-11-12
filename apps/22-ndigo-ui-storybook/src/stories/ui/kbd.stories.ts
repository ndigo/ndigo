/**
 * UI/Kbd — key caps and keyboard chords.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

const meta = {
    title: 'UI/Kbd',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/kbd') } },
    },
    render: () => html`
        <div style="display: grid; gap: 1rem">
            <p>Press <kbd class="nd-kbd">Ctrl</kbd> + <kbd class="nd-kbd">K</kbd> to search.</p>

            <span class="nd-kbd-group">
                <kbd class="nd-kbd">⌘</kbd>
                <kbd class="nd-kbd">K</kbd>
            </span>
        </div>
    `,
} satisfies Meta;

export default meta;
type Story = StoryObj;

/** Inline key caps and a grouped chord. */
export const Default: Story = {};
