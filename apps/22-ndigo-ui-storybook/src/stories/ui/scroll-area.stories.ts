/**
 * UI/Scroll Area — styled scrolling viewport with machine-driven scrollbars.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

const PARAGRAPHS = Array.from(
    { length: 12 },
    (_, index) => `Paragraph ${index + 1}: the viewport scrolls while the track and thumb stay in sync.`
);

const meta = {
    title: 'UI/Scroll Area',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/scroll-area') } },
    },
    render: () => html`
        <nd-scroll-area class="panel" style="max-inline-size: 32rem">
            <div data-part="root">
                <div data-part="viewport" style="block-size: 12rem">
                    <div data-part="content">
                        ${PARAGRAPHS.map((paragraph) => html`<p style="margin-block: 0 0.75rem">${paragraph}</p>`)}
                    </div>
                </div>
                <div data-part="scrollbar" data-orientation="vertical">
                    <div data-part="thumb"></div>
                </div>
                <div data-part="scrollbar" data-orientation="horizontal">
                    <div data-part="thumb"></div>
                </div>
                <div data-part="corner"></div>
            </div>
        </nd-scroll-area>
    `,
} satisfies Meta;

export default meta;
type Story = StoryObj;

/** A fixed-height viewport with vertical overflow and a hidden horizontal bar. */
export const Default: Story = {};
