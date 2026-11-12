/**
 * UI/Navigation Menu — site navigation with dropdown content.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { readmeDescription } from '../../_readme';

type Orientation = 'horizontal' | 'vertical';

interface NavigationMenuArgs {
    orientation: Orientation;
    /** Initial open item value. */
    value: string;
    openDelay: number;
    closeDelay: number;
    disableHoverTrigger: boolean;
    disableClickTrigger: boolean;
}

const meta = {
    title: 'UI/Navigation Menu',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/navigation-menu') } },
    },
    argTypes: {
        orientation: { control: 'select', options: ['horizontal', 'vertical'] },
        value: { control: 'select', options: ['', 'products', 'pricing'] },
        openDelay: { control: 'number' },
        closeDelay: { control: 'number' },
        disableHoverTrigger: { control: 'boolean' },
        disableClickTrigger: { control: 'boolean' },
    },
    args: {
        orientation: 'horizontal',
        value: '',
        openDelay: 200,
        closeDelay: 300,
        disableHoverTrigger: false,
        disableClickTrigger: false,
    },
    render: ({ orientation, value, openDelay, closeDelay, disableHoverTrigger, disableClickTrigger }) => html`
        <nd-navigation-menu
            aria-label="Main"
            orientation=${orientation}
            value=${value === '' ? nothing : value}
            open-delay=${String(openDelay)}
            close-delay=${String(closeDelay)}
            ?disable-hover-trigger=${disableHoverTrigger}
            ?disable-click-trigger=${disableClickTrigger}
        >
            <ul data-part="list">
                <li data-part="item" data-value="products">
                    <button data-part="trigger" type="button">Products</button>
                    <div data-part="content">
                        <a data-part="link" href="#navigation">Analytics</a>
                        <a data-part="link" href="#navigation" aria-current="page">Marketing</a>
                    </div>
                </li>
                <li data-part="item" data-value="pricing">
                    <a data-part="link" href="#navigation">Pricing</a>
                </li>
            </ul>
        </nd-navigation-menu>
    `,
} satisfies Meta<NavigationMenuArgs>;

export default meta;
type Story = StoryObj<NavigationMenuArgs>;

/** Horizontal navigation, closed. */
export const Default: Story = {};

/** The Products dropdown open on load. */
export const Open: Story = {
    args: { value: 'products' },
};

/** The vertical orientation used in a sidebar. */
export const Vertical: Story = {
    args: { orientation: 'vertical' },
};
