/**
 * UI/Card — content surface with header, media, content, and footer parts.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { readmeDescription } from '../../_readme';
import { PLACEHOLDER_IMAGE } from '../_placeholder';

interface CardArgs {
    title: string;
    description: string;
    /** Renders the `.nd-card__media` image when set. */
    media: boolean;
    /** Adds the interactive hover/focus treatment. */
    interactive: boolean;
}

const meta = {
    title: 'UI/Card',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/card') } },
    },
    argTypes: {
        title: { control: 'text' },
        description: { control: 'text' },
        media: { control: 'boolean' },
        interactive: { control: 'boolean' },
    },
    args: {
        title: 'Quarterly report',
        description: 'Revenue and retention for Q3.',
        media: true,
        interactive: false,
    },
    render: ({ title, description, media, interactive }) => html`
        <article class="nd-card ${interactive ? 'nd-card--interactive' : ''}" style="max-inline-size: 24rem">
            ${media ? html`<img class="nd-card__media" src=${PLACEHOLDER_IMAGE} alt="" />` : nothing}
            <div class="nd-card__header">
                <h2 class="nd-card__title">${title}</h2>
                <p class="nd-card__description">${description}</p>
            </div>
            <div class="nd-card__content">
                <p>Download the PDF or open the dashboard.</p>
            </div>
            <div class="nd-card__footer">
                <button class="nd-button" data-variant="primary" type="button">Open</button>
                <button class="nd-button" data-variant="ghost" type="button">Share</button>
            </div>
        </article>
    `,
} satisfies Meta<CardArgs>;

export default meta;
type Story = StoryObj<CardArgs>;

/** The full card: media, header, content, footer. */
export const Default: Story = {};

/** Header, content, and footer without media. */
export const TextOnly: Story = {
    args: { media: false, title: 'Deployment checklist', description: 'Everything that ships with the release.' },
};

/** The interactive treatment used when the whole card is a link target. */
export const Interactive: Story = {
    args: { interactive: true, media: false, title: 'Open the dashboard', description: 'Live metrics for the team.' },
    render: ({ title, description, interactive }) => html`
        <article
            class="nd-card ${interactive ? 'nd-card--interactive' : ''}"
            style="max-inline-size: 24rem"
            tabindex="0"
        >
            <div class="nd-card__header">
                <h2 class="nd-card__title">${title}</h2>
                <p class="nd-card__description">${description}</p>
            </div>
            <div class="nd-card__content">
                <p>The whole surface responds to hover and focus.</p>
            </div>
        </article>
    `,
};
