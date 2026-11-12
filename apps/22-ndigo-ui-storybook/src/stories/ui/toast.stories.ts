/**
 * UI/Toast — a single transient notification with a live-region contract.
 *
 * Storybook cannot re-show a dismissed toast on its own, so the stories pin
 * `duration="0"` (keeps it open) unless the point of the story is the timer.
 */
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastArgs {
    /** Selects the tone and the live-region politeness. */
    type: ToastType;
    /** Auto-dismiss delay in ms; `0` keeps the toast open. */
    duration: number;
    /** Controlled visibility; reflected by the element. */
    open: boolean;
    title: string;
    description: string;
}

const meta = {
    title: 'UI/Toast',
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: { description: { component: readmeDescription('ui/toast') } },
    },
    argTypes: {
        type: { control: 'select', options: ['info', 'success', 'warning', 'error'] },
        duration: { control: { type: 'number', min: 0, step: 500 } },
        open: { control: 'boolean', description: 'Controlled visibility; `show()`/`hide()` reflect it.' },
        title: { control: 'text' },
        description: { control: 'text' },
    },
    args: {
        type: 'success',
        duration: 0,
        open: true,
        title: 'Saved',
        description: 'Your changes are live.',
    },
    render: ({ type, duration, open, title, description }) => html`
        <nd-toast type=${type} duration=${String(duration)} ?open=${open}>
            <span data-part="title">${title}</span>
            <span data-part="description">${description}</span>
            <button data-part="close-trigger" type="button" aria-label="Dismiss notification">×</button>
        </nd-toast>
    `,
} satisfies Meta<ToastArgs>;

export default meta;
type Story = StoryObj<ToastArgs>;

/** Open on load, with the auto-dismiss timer disabled. */
export const Default: Story = {};

/** Starts hidden; `play` calls `.show()` exactly as an app would. */
export const Timed: Story = {
    args: { open: false, duration: 8000, title: 'Message sent', description: 'The draft is on its way.' },
    play: ({ canvasElement }) => {
        canvasElement.querySelector<HTMLElement & { show(): void }>('nd-toast')?.show();
    },
};

/** All four documented tones side by side, in normal flow. */
export const Types: Story = {
    render: () => html`
        <div style="display: grid; gap: 1rem; max-inline-size: 30rem; padding: 2rem 0">
            ${(['info', 'success', 'warning', 'error'] as const).map(
                (type) =>
                    html`<nd-toast type=${type} duration="0" open style="position: static; inline-size: 100%">
                        <span data-part="title">${type}</span>
                        <span data-part="description">This is the ${type} tone.</span>
                        <button data-part="close-trigger" type="button" aria-label="Dismiss ${type} notification">
                            ×
                        </button>
                    </nd-toast>`
            )}
        </div>
    `,
};
