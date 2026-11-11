/**
 * Storybook stories for the Ndigo UI slider component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Slider',
    tags: ['autodocs'],
    render: () =>
        html`<nd-slider value="40" min="0" max="100" step="1">
            <label data-part="label">Volume</label>
            <div data-part="control">
                <div data-part="track"><div data-part="range"></div></div>
                <div data-part="thumb"></div>
            </div>
        </nd-slider>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
