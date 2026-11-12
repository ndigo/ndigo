/**
 * UI/Typography — scoped prose styles for rendered long-form content.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

const meta = {
    title: 'UI/Typography',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/typography') } },
    },
    render: () => html`
        <article class="nd-prose" style="max-inline-size: 44rem">
            <h2>Release notes</h2>
            <p>
                The registry now ships <strong>39 items</strong>, including the new <code>nd-a2ui-surface</code> and the
                blocks that compose existing elements. Read the <a href="#typography">changelog</a> for the full list.
            </p>
            <ul>
                <li>New tokens</li>
                <li>Copy-in components</li>
                <li>Docs for every item</li>
            </ul>
            <blockquote>Own the code you ship.</blockquote>
            <h3>Ordered steps</h3>
            <ol>
                <li>Install the item.</li>
                <li>Import its stylesheet.</li>
                <li>Render the markup.</li>
            </ol>
            <p>
                Inline code, <kbd class="nd-kbd">Ctrl</kbd> chords, and <mark class="nd-mark">marks</mark> keep their
                base styling inside prose.
            </p>
        </article>
    `,
} satisfies Meta;

export default meta;
type Story = StoryObj;

/** A representative release-note page, scoped by `.nd-prose`. */
export const Default: Story = {};
