/**
 * UI/Breadcrumb — hierarchical page trail on native navigation.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

interface BreadcrumbArgs {
    /** The trailing crumb, marked `aria-current="page"`. */
    current: string;
    /** Crumbs before the current page. */
    trail: string[];
}

const meta = {
    title: 'UI/Breadcrumb',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/breadcrumb') } },
    },
    argTypes: {
        current: { control: 'text' },
        trail: { control: 'object' },
    },
    args: { current: 'Components', trail: ['Home', 'Docs'] },
    render: ({ current, trail }) => html`
        <nav class="nd-breadcrumb" aria-label="Breadcrumb">
            <ol class="nd-breadcrumb__list">
                ${trail.map(
                    (crumb, index) =>
                        html`<li class="nd-breadcrumb__item">
                            <a class="nd-breadcrumb__link" href=${`#${index}`}>${crumb}</a>
                        </li>`
                )}
                <li class="nd-breadcrumb__item"><span aria-current="page">${current}</span></li>
            </ol>
        </nav>
    `,
} satisfies Meta<BreadcrumbArgs>;

export default meta;
type Story = StoryObj<BreadcrumbArgs>;

/** Home → Docs → Components. */
export const Default: Story = {};

/** A deeper trail, showing how the separators repeat. */
export const Deep: Story = {
    args: { trail: ['Home', 'Docs', 'Registry', 'UI'], current: 'Button' },
};
