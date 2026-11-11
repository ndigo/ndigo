/**
 * Storybook stories for the Ndigo UI breadcrumb component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Breadcrumb',
    tags: ['autodocs'],
    render: () =>
        html`<nav class="nd-breadcrumb" aria-label="Breadcrumb">
            <ol class="nd-breadcrumb__list">
                <li class="nd-breadcrumb__item"><a class="nd-breadcrumb__link" href="/">Home</a></li>
                <li class="nd-breadcrumb__item"><a class="nd-breadcrumb__link" href="/docs">Docs</a></li>
                <li class="nd-breadcrumb__item"><span aria-current="page">Components</span></li>
            </ol>
        </nav>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
