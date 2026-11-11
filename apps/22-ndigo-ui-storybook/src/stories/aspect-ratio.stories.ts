/**
 * Storybook stories for the Ndigo UI aspect-ratio component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Aspect Ratio',
    tags: ['autodocs'],
    render: () =>
        html`<div class="nd-aspect">
                <img src="/cover.jpg" alt="Team photo" />
            </div>

            <div class="nd-aspect" style="--nd-aspect-ratio: 1">
                <video src="/clip.mp4" controls></video>
            </div>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
