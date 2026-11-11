/**
 * Storybook stories for the Ndigo UI sidebar component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'Blocks/Sidebar',
    tags: ['autodocs'],
    render: () =>
        html`<aside class="nd-sidebar" aria-label="Section navigation">
            <div class="nd-sidebar__header">
                <span class="nd-sidebar__brand">Workspace</span>
                <span class="nd-sidebar__version">v0.0.1</span>
            </div>
            <nav class="nd-sidebar__nav">
                <details class="nd-sidebar__group" open>
                    <summary class="nd-sidebar__group-label">Getting started</summary>
                    <ul class="nd-sidebar__list">
                        <li><a class="nd-sidebar__link" href="#overview" aria-current="page">Overview</a></li>
                        <li><a class="nd-sidebar__link" href="#install">Installation</a></li>
                    </ul>
                </details>
            </nav>
            <div class="nd-sidebar__footer">
                <a class="nd-sidebar__link" href="#settings">Settings</a>
            </div>
        </aside>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
