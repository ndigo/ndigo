/**
 * Blocks/App Shell — the responsive frame: skip link, banner, navigation,
 * sidebar, main landmark, footer.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

const meta = {
    title: 'Blocks/App Shell',
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: { description: { component: readmeDescription('blocks/app-shell') } },
    },
    render: () => html`
        <div class="nd-app-shell">
            <a class="nd-skip-link" href="#nd-main">Skip to content</a>

            <header class="nd-app-shell__banner">
                <a class="nd-app-shell__brand" href="#nd-main">
                    <span class="nd-mark">Ndigo</span>
                </a>

                <nav class="nd-app-shell__nav" aria-label="Primary">
                    <a href="#nd-main" aria-current="page">Docs</a>
                    <a href="#nd-main">Components</a>
                    <a href="#nd-main">Blog</a>
                </nav>

                <div class="nd-app-shell__actions">
                    <button class="nd-button" data-variant="ghost" data-size="sm" type="button">Sign in</button>
                    <button class="nd-button" data-variant="primary" data-size="sm" type="button">Get started</button>
                </div>
            </header>

            <div class="nd-app-shell__body">
                <aside class="nd-app-shell__sidebar" aria-label="Section navigation">
                    <nav aria-label="Sections">
                        <a href="#nd-main" aria-current="page">Overview</a>
                        <a href="#nd-main">Install</a>
                        <a href="#nd-main">API</a>
                    </nav>
                </aside>

                <main id="nd-main" class="nd-app-shell__main" tabindex="-1">
                    <h1>Page title</h1>
                    <p>
                        The shell gives every page the same banner, navigation, and footer. Replace this region with the
                        page content; the landmarks stay unique and labelled.
                    </p>
                </main>
            </div>

            <footer class="nd-app-shell__footer">
                <p>© 2026 Ndigo</p>
            </footer>
        </div>
    `,
} satisfies Meta;

export default meta;
type Story = StoryObj;

/** The canonical frame, at full viewport height. */
export const Default: Story = {};
