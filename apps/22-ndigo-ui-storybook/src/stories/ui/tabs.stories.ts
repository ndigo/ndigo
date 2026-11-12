/**
 * UI/Tabs — accessible tab set built on the Zag.js tabs machine.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

interface TabsArgs {
    /** The initially selected tab value. */
    value: string;
}

const TABS = [
    { value: 'overview', label: 'Overview', body: 'The item ships as source you own and copy in.' },
    { value: 'install', label: 'Install', body: 'Copy the markup, import the stylesheet, keep the parts.' },
    { value: 'api', label: 'API', body: 'Attributes, events, and the methods on the element.' },
];

const meta = {
    title: 'UI/Tabs',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/tabs') } },
    },
    argTypes: {
        value: { control: 'select', options: TABS.map((tab) => tab.value) },
    },
    args: { value: 'overview' },
    render: ({ value }) => html`
        <nd-tabs value=${value} style="max-inline-size: 32rem">
            <div data-part="root">
                <div data-part="list">
                    ${TABS.map(
                        (tab) => html`<button data-part="trigger" data-value=${tab.value}>${tab.label}</button>`
                    )}
                </div>
                ${TABS.map((tab) => html`<div data-part="content" data-value=${tab.value}>${tab.body}</div>`)}
            </div>
        </nd-tabs>
    `,
} satisfies Meta<TabsArgs>;

export default meta;
type Story = StoryObj<TabsArgs>;

/** The first tab selected. */
export const Default: Story = {};

/** The third tab selected through the `value` attribute. */
export const ApiTab: Story = {
    args: { value: 'api' },
};
