/**
 * Storybook stories for the Ndigo UI card component.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';

const meta: Meta = {
    title: 'UI/Card',
    tags: ['autodocs'],
    render: () =>
        html`<article class="nd-card">
            <img class="nd-card__media" src="/cover.jpg" alt="" />
            <div class="nd-card__header">
                <h2 class="nd-card__title">Quarterly report</h2>
                <p class="nd-card__description">Revenue and retention for Q3.</p>
            </div>
            <div class="nd-card__content">
                <p>Download the PDF or open the dashboard.</p>
            </div>
            <div class="nd-card__footer">
                <button class="nd-button" data-variant="primary" type="button">Open</button>
                <button class="nd-button" data-variant="ghost" type="button">Share</button>
            </div>
        </article>`,
};

export default meta;
type Story = StoryObj;
export const Default: Story = {};
