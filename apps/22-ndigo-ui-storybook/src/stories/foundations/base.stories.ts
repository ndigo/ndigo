/**
 * The base layer: platform-element defaults and the brand utilities that no
 * registry item owns.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'Foundations/Base Layer',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component:
                    '`theme/base.css` styles platform elements directly — no classes, no runtime. Registry items build on it; the brand utilities (`nd-display`, `nd-gradient-text`, `nd-gradient-bg`, `nd-mark`) ship here too.',
            },
        },
    },
};

export default meta;
type Story = StoryObj;

/** Element defaults: headings, body copy, links, code, media. */
export const Default: Story = {
    render: () => html`
        <article style="max-inline-size: 44rem; display: grid; gap: 1rem">
            <h1>Heading level 1</h1>
            <h2>Heading level 2</h2>
            <h3>Heading level 3</h3>
            <p>
                Body copy uses the sans stack. Inline <code>code</code>, <a href="#base">links</a>, and
                <samp>sample output</samp> inherit the base layer. <mark class="nd-mark">Marks</mark> highlight a
                phrase.
            </p>
            <pre><code>const base = 'applies without a class';</code></pre>
            <blockquote>Every item builds on this layer, so nothing is restyled twice.</blockquote>
            <p>
                <button class="nd-button" data-variant="primary" type="button">Button item</button>
                <button class="nd-button" data-variant="ghost" type="button">Ghost</button>
            </p>
        </article>
    `,
};

/** The brand utilities: display type, gradient text, gradient surface, mark. */
export const Utilities: Story = {
    render: () => html`
        <div style="display: grid; gap: 1.5rem; max-inline-size: 44rem">
            <h2 class="nd-display" style="font-size: 2.5rem">Display type</h2>
            <p class="nd-gradient-text" style="font-size: 1.75rem; font-weight: 600; margin: 0">Gradient text</p>
            <div
                class="nd-gradient-bg"
                style="border-radius: var(--nd-radius-lg); padding: 2rem; color: var(--nd-color-on-accent)"
            >
                Gradient surface
            </div>
            <p>Regular copy with a <mark class="nd-mark">highlighted phrase</mark>.</p>
        </div>
    `,
};
