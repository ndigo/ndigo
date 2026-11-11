/**
 * Storybook stories for the Ndigo UI typography component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Typography',
    tags: ['autodocs'],
    render: () =>
        html`<article class="nd-prose">
            <h2>Release notes</h2>
            <p>The registry now ships <strong>39 items</strong>.</p>
            <ul>
                <li>New tokens</li>
                <li>Copy-in components</li>
            </ul>
            <blockquote>Own the code you ship.</blockquote>
        </article>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
