/**
 * Storybook stories for the Ndigo UI scroll-area component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Scroll Area',
    tags: ['autodocs'],
    render: () =>
        html`<nd-scroll-area class="panel">
            <div data-part="root">
                <div data-part="viewport">
                    <div data-part="content">
                        <p>Long content goes here.</p>
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
        </nd-scroll-area>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
