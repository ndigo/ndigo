/**
 * UI/Slider — single-value range built on the Zag.js slider machine.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

interface SliderArgs {
    /** Initial value. */
    value: number;
    min: number;
    max: number;
    step: number;
    name: string;
    label: string;
}

const meta = {
    title: 'UI/Slider',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/slider') } },
    },
    argTypes: {
        value: { control: { type: 'number', min: 0, max: 100, step: 1 } },
        min: { control: 'number' },
        max: { control: 'number' },
        step: { control: 'number' },
        name: { control: 'text' },
        label: { control: 'text' },
    },
    args: { value: 40, min: 0, max: 100, step: 1, name: 'volume', label: 'Volume' },
    render: ({ value, min, max, step, name, label }) => html`
        <nd-slider
            value=${String(value)}
            min=${String(min)}
            max=${String(max)}
            step=${String(step)}
            name=${name}
            style="max-inline-size: 24rem"
        >
            <label data-part="label">${label}</label>
            <div data-part="control">
                <div data-part="track"><div data-part="range"></div></div>
                <div data-part="thumb"></div>
            </div>
        </nd-slider>
    `,
} satisfies Meta<SliderArgs>;

export default meta;
type Story = StoryObj<SliderArgs>;

/** A 0–100 range at 40. */
export const Default: Story = {};

/** A stepped range between 1 and 10. */
export const Steps: Story = {
    args: { value: 3, min: 1, max: 10, step: 1, name: 'rating', label: 'Rating' },
};
