/**
 * Storybook stories for the Ndigo UI separator component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Separator',
    tags: ['autodocs'],
    render: () =>
        html`<hr class="nd-separator" />

            <div class="nd-row">
                <span>Left</span>
                <div
                    class="nd-separator"
                    data-orientation="vertical"
                    role="separator"
                    aria-orientation="vertical"
                ></div>
                <span>Right</span>
            </div>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
