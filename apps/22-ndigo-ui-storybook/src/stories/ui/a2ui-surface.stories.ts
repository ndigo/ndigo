/**
 * UI/A2UI Surface — renders A2UI 1.0 messages with the installed `nd-*`
 * elements.
 *
 * The surface only renders after `.messages` is assigned, so every story binds
 * the property instead of leaving an empty element.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

/** A single A2UI component node, structurally typed for the story controls. */
interface A2uiNode {
    id: string;
    component: string;
    [prop: string]: unknown;
}

interface A2uiMessage {
    version: '1.0';
    createSurface?: { surfaceId: string; catalogId: string };
    updateComponents?: { surfaceId: string; components: A2uiNode[] };
}

interface SurfaceArgs {
    /** A2UI 1.0 message payload: create the surface, then update its components. */
    messages: A2uiMessage[];
}

const NOTIFICATION_MESSAGES: A2uiMessage[] = [
    { version: '1.0', createSurface: { surfaceId: 'settings', catalogId: 'ndigo-ui' } },
    {
        version: '1.0',
        updateComponents: {
            surfaceId: 'settings',
            components: [{ id: 'root', component: 'Switch', checked: true, label: 'Email notifications' }],
        },
    },
];

const meta = {
    title: 'UI/A2UI Surface',
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: { description: { component: readmeDescription('ui/a2ui-surface') } },
    },
    argTypes: {
        messages: { control: 'object', description: 'A2UI 1.0 messages; assign to `.messages`.' },
    },
    args: { messages: NOTIFICATION_MESSAGES },
    render: ({ messages }) => html` <nd-a2ui-surface .messages=${messages}></nd-a2ui-surface> `,
} satisfies Meta<SurfaceArgs>;

export default meta;
type Story = StoryObj<SurfaceArgs>;

/** One surface rendering a single installed component. */
export const Default: Story = {};

/** Two surfaces in one payload, each projected under its own region. */
export const MultipleSurfaces: Story = {
    args: {
        messages: [
            { version: '1.0', createSurface: { surfaceId: 'account', catalogId: 'ndigo-ui' } },
            {
                version: '1.0',
                updateComponents: {
                    surfaceId: 'account',
                    components: [{ id: 'root', component: 'Switch', checked: true, label: 'Two-factor auth' }],
                },
            },
            { version: '1.0', createSurface: { surfaceId: 'alerts', catalogId: 'ndigo-ui' } },
            {
                version: '1.0',
                updateComponents: {
                    surfaceId: 'alerts',
                    components: [{ id: 'root', component: 'Switch', checked: false, label: 'Product updates' }],
                },
            },
        ],
    },
};

/**
 * An unknown component name: nothing renders, the host carries `data-error`,
 * and `nd-a2ui-error` reports the reason.
 */
export const UnknownComponent: Story = {
    args: {
        messages: [
            { version: '1.0', createSurface: { surfaceId: 'broken', catalogId: 'ndigo-ui' } },
            {
                version: '1.0',
                updateComponents: {
                    surfaceId: 'broken',
                    components: [{ id: 'root', component: 'Mystery' }],
                },
            },
        ],
    },
    render: ({ messages }) => html`
        <div style="display: grid; gap: 1rem">
            <nd-a2ui-surface data-surface .messages=${messages}></nd-a2ui-surface>
            <p data-error-out role="status" style="font-family: var(--nd-font-mono); font-size: 0.8125rem"></p>
        </div>
    `,
    play: ({ canvasElement }) => {
        const surface = canvasElement.querySelector('[data-surface]');
        const out = canvasElement.querySelector('[data-error-out]');
        if (out instanceof HTMLElement) {
            out.textContent = surface?.getAttribute('data-error') ?? 'No error reported.';
        }
    },
};
