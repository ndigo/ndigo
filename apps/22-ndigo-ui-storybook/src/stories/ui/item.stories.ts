/**
 * UI/Item — list row with media, text, and actions.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

interface Person {
    initials: string;
    name: string;
    role: string;
}

interface ItemArgs {
    /** Rows rendered into `.nd-list`. */
    people: Person[];
    /** Adds the row separator. */
    bordered: boolean;
    /** Shows the trailing actions column. */
    actions: boolean;
}

const PEOPLE: Person[] = [
    { initials: 'AL', name: 'Ada Lovelace', role: 'Engineering' },
    { initials: 'GH', name: 'Grace Hopper', role: 'Research' },
    { initials: 'KH', name: 'Katherine Johnson', role: 'Mathematics' },
];

const meta = {
    title: 'UI/Item',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/item') } },
    },
    argTypes: {
        people: { control: 'object' },
        bordered: { control: 'boolean' },
        actions: { control: 'boolean' },
    },
    args: { people: PEOPLE, bordered: true, actions: true },
    render: ({ people, bordered, actions }) => html`
        <ul class="nd-list" style="max-inline-size: 32rem">
            ${people.map(
                (person) =>
                    html`<li class="nd-item ${bordered ? 'nd-item--bordered' : ''}">
                        <span class="nd-item__media">${person.initials}</span>
                        <div class="nd-item__content">
                            <span class="nd-item__title">${person.name}</span>
                            <span class="nd-item__description">${person.role}</span>
                        </div>
                        ${
                            actions
                                ? html`<div class="nd-item__actions">
                                      <button class="nd-button" data-variant="ghost" data-size="sm" type="button">
                                          Edit
                                      </button>
                                  </div>`
                                : null
                        }
                    </li>`
            )}
        </ul>
    `,
} satisfies Meta<ItemArgs>;

export default meta;
type Story = StoryObj<ItemArgs>;

/** A bordered list with media, description, and an action per row. */
export const Default: Story = {};

/** The minimal row: title and supporting text, no separator or actions. */
export const Plain: Story = {
    args: { people: PEOPLE.slice(0, 2), bordered: false, actions: false },
};
