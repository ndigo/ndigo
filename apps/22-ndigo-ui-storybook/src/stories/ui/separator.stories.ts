/**
 * UI/Separator — horizontal and vertical rules.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

const meta = {
    title: 'UI/Separator',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/separator') } },
    },
    render: () => html`
        <div style="display: grid; gap: 1.5rem; max-inline-size: 32rem">
            <p>Above the rule.</p>
            <hr class="nd-separator" />
            <p>Below the rule.</p>

            <div class="nd-row" style="display: flex; align-items: center; gap: 1rem; block-size: 2rem">
                <span>Left</span>
                <div
                    class="nd-separator"
                    data-orientation="vertical"
                    role="separator"
                    aria-orientation="vertical"
                ></div>
                <span>Right</span>
            </div>
        </div>
    `,
} satisfies Meta;

export default meta;
type Story = StoryObj;

/** A horizontal rule and the vertical orientation. */
export const Default: Story = {};
