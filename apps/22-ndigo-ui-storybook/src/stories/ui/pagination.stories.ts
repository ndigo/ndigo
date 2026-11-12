/**
 * UI/Pagination — native page navigation with a current page and disabled edges.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

interface PaginationArgs {
    /** The current page, marked `aria-current="page"`. */
    page: number;
    pageCount: number;
}

const meta = {
    title: 'UI/Pagination',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/pagination') } },
    },
    argTypes: {
        page: { control: { type: 'number', min: 1, max: 10, step: 1 } },
        pageCount: { control: { type: 'number', min: 2, max: 10, step: 1 } },
    },
    args: { page: 2, pageCount: 8 },
    render: ({ page, pageCount }) => {
        const visible = [...new Set([1, page, page + 1, pageCount])]
            .filter((number) => number >= 1 && number <= pageCount)
            .sort((alpha, beta) => alpha - beta);
        return html`
            <nav class="nd-pagination" aria-label="Pagination">
                <ul class="nd-pagination__list">
                    <li>
                        ${
                            page === 1
                                ? html`<span class="nd-pagination__link" data-direction="previous" aria-disabled="true"
                                      >‹ Previous</span
                                  >`
                                : html`<a class="nd-pagination__link" data-direction="previous" href="#pagination"
                                      >‹ Previous</a
                                  >`
                        }
                    </li>
                    ${visible.map(
                        (number, index) => html`
                            ${
                                index > 0 && number - visible[index - 1] > 1
                                    ? html`<li><span class="nd-pagination__ellipsis" aria-hidden="true">…</span></li>`
                                    : null
                            }
                            <li>
                                ${
                                    number === page
                                        ? html`<span class="nd-pagination__link" aria-current="page">${number}</span>`
                                        : html`<a class="nd-pagination__link" href="#pagination">${number}</a>`
                                }
                            </li>
                        `
                    )}
                    <li>
                        ${
                            page === pageCount
                                ? html`<span class="nd-pagination__link" data-direction="next" aria-disabled="true"
                                      >Next ›</span
                                  >`
                                : html`<a class="nd-pagination__link" data-direction="next" href="#pagination"
                                      >Next ›</a
                                  >`
                        }
                    </li>
                </ul>
            </nav>
        `;
    },
} satisfies Meta<PaginationArgs>;

export default meta;
type Story = StoryObj<PaginationArgs>;

/** The canonical trail with a gap on both sides of the current page. */
export const Default: Story = {};

/** The first page, where the previous edge is disabled. */
export const FirstPage: Story = {
    args: { page: 1 },
};
