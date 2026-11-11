/**
 * Storybook stories for the Ndigo UI app-shell component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'Blocks/App Shell',
    tags: ['autodocs'],
    render: () =>
        html`<div class="nd-app-shell">
            <a class="nd-skip-link" href="#nd-main">Skip to content</a>
            <header class="nd-app-shell__banner">…</header>
            <div class="nd-app-shell__body">
                <aside class="nd-app-shell__sidebar" aria-label="Section navigation">…</aside>
                <main id="nd-main" class="nd-app-shell__main" tabindex="-1">…</main>
            </div>
            <footer class="nd-app-shell__footer">…</footer>
        </div>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
