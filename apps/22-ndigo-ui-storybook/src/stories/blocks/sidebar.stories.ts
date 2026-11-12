/**
 * Blocks/Sidebar — section navigation with native `<details>` groups.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

interface SidebarArgs {
    /** Marks `aria-current="page"` on the matching link. */
    current: string;
}

const meta = {
    title: 'Blocks/Sidebar',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('blocks/sidebar') } },
    },
    argTypes: {
        current: { control: 'text', description: 'The link marked as the current page.' },
    },
    args: { current: 'Overview' },
    render: ({ current }) => html`
        <div style="display: grid; grid-template-columns: minmax(12rem, 16rem) minmax(0, 1fr); gap: 2rem">
            <aside class="nd-sidebar" aria-label="Section navigation">
                <div class="nd-sidebar__header">
                    <span class="nd-sidebar__brand">Workspace</span>
                    <span class="nd-sidebar__version">v0.0.1</span>
                </div>

                <nav class="nd-sidebar__nav">
                    <details class="nd-sidebar__group" open>
                        <summary class="nd-sidebar__group-label">Getting started</summary>
                        <ul class="nd-sidebar__list">
                            <li>
                                <a
                                    class="nd-sidebar__link"
                                    href="#nd-sidebar"
                                    aria-current=${current === 'Overview' ? 'page' : 'false'}
                                    >Overview</a
                                >
                            </li>
                            <li>
                                <a
                                    class="nd-sidebar__link"
                                    href="#nd-sidebar"
                                    aria-current=${current === 'Installation' ? 'page' : 'false'}
                                    >Installation</a
                                >
                            </li>
                            <li>
                                <a
                                    class="nd-sidebar__link"
                                    href="#nd-sidebar"
                                    aria-current=${current === 'Theming' ? 'page' : 'false'}
                                    >Theming</a
                                >
                            </li>
                        </ul>
                    </details>

                    <details class="nd-sidebar__group" open>
                        <summary class="nd-sidebar__group-label">Components</summary>
                        <ul class="nd-sidebar__list">
                            <li>
                                <a
                                    class="nd-sidebar__link"
                                    href="#nd-sidebar"
                                    aria-current=${current === 'Buttons' ? 'page' : 'false'}
                                    >Buttons</a
                                >
                            </li>
                            <li>
                                <a
                                    class="nd-sidebar__link"
                                    href="#nd-sidebar"
                                    aria-current=${current === 'Cards' ? 'page' : 'false'}
                                    >Cards</a
                                >
                            </li>
                            <li>
                                <a
                                    class="nd-sidebar__link"
                                    href="#nd-sidebar"
                                    aria-current=${current === 'Tables' ? 'page' : 'false'}
                                    >Tables</a
                                >
                            </li>
                        </ul>
                    </details>

                    <details class="nd-sidebar__group">
                        <summary class="nd-sidebar__group-label">Reference</summary>
                        <ul class="nd-sidebar__list">
                            <li>
                                <a
                                    class="nd-sidebar__link"
                                    href="#nd-sidebar"
                                    aria-current=${current === 'Tokens' ? 'page' : 'false'}
                                    >Tokens</a
                                >
                            </li>
                            <li>
                                <a
                                    class="nd-sidebar__link"
                                    href="#nd-sidebar"
                                    aria-current=${current === 'Registry' ? 'page' : 'false'}
                                    >Registry</a
                                >
                            </li>
                        </ul>
                    </details>
                </nav>

                <div class="nd-sidebar__footer">
                    <a class="nd-sidebar__link" href="#nd-sidebar">Settings</a>
                    <p class="nd-sidebar__note">Docs stay in the registry.</p>
                </div>
            </aside>

            <main id="nd-sidebar" tabindex="-1">
                <h2 style="margin-block-start: 0">Content column</h2>
                <p>
                    The panel sticks beside the content on wide screens and stacks above it below the
                    <code>48rem</code> breakpoint. Groups open and close natively; no script is involved.
                </p>
            </main>
        </div>
    `,
} satisfies Meta<SidebarArgs>;

export default meta;
type Story = StoryObj<SidebarArgs>;

/** The canonical panel beside a content column. */
export const Default: Story = {};

/** Every group collapsed, showing the summary labels alone. */
export const Collapsed: Story = {
    render: () => html`
        <aside class="nd-sidebar" aria-label="Section navigation" style="position: static">
            <div class="nd-sidebar__header">
                <span class="nd-sidebar__brand">Workspace</span>
                <span class="nd-sidebar__version">v0.0.1</span>
            </div>
            <nav class="nd-sidebar__nav">
                ${['Getting started', 'Components', 'Reference'].map(
                    (label) =>
                        html`<details class="nd-sidebar__group">
                            <summary class="nd-sidebar__group-label">${label}</summary>
                            <ul class="nd-sidebar__list">
                                <li><a class="nd-sidebar__link" href="#nd-sidebar">Entry</a></li>
                            </ul>
                        </details>`
                )}
            </nav>
        </aside>
    `,
};
