/**
 * Storybook stories for the Ndigo UI pagination component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Pagination',
    tags: ['autodocs'],
    render: () =>
        html`<nav class="nd-pagination" aria-label="Pagination">
            <ul class="nd-pagination__list">
                <li>
                    <span class="nd-pagination__link" data-direction="previous" aria-disabled="true">‹ Previous</span>
                </li>
                <li><a class="nd-pagination__link" href="?page=1">1</a></li>
                <li><span class="nd-pagination__link" aria-current="page">2</span></li>
                <li><a class="nd-pagination__link" href="?page=3">3</a></li>
                <li><span class="nd-pagination__ellipsis" aria-hidden="true">…</span></li>
                <li><a class="nd-pagination__link" href="?page=8">8</a></li>
                <li><a class="nd-pagination__link" data-direction="next" href="?page=3">Next ›</a></li>
            </ul>
        </nav>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
