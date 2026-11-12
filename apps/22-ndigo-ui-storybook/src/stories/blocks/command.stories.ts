/**
 * Blocks/Command — the palette composition of `nd-dialog` + `nd-combobox`.
 *
 * The story renders the block's canonical markup and wires it with the block's
 * own `initCommandPalette`, so Cmd/Ctrl+K, filtering, and selection are live.
 */
import { initCommandPalette } from '@registry/blocks/command/command';
import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { readmeDescription } from '../../_readme';

interface Command {
    value: string;
    label: string;
}

interface CommandArgs {
    /** The `[data-part="item"]` rows; `value` must be unique. */
    commands: Command[];
}

const COMMANDS: Command[] = [
    { value: 'new-file', label: 'New file' },
    { value: 'open-settings', label: 'Open settings' },
    { value: 'toggle-theme', label: 'Toggle theme' },
    { value: 'search-docs', label: 'Search documentation' },
    { value: 'invite-teammate', label: 'Invite teammate' },
    { value: 'sign-out', label: 'Sign out' },
];

const meta = {
    title: 'Blocks/Command',
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: { description: { component: readmeDescription('blocks/command') } },
    },
    argTypes: {
        commands: { control: 'object', description: 'Command rows; `value` must be unique.' },
    },
    args: { commands: COMMANDS },
    render: ({ commands }) => html`
        <div class="nd-command" data-command style="padding: 2rem">
            <nd-dialog
                class="nd-command__dialog"
                trigger-label="Open command palette"
                initial-focus="[data-part='input']"
            >
                <button
                    class="nd-button nd-command__trigger"
                    data-variant="secondary"
                    data-part="trigger"
                    type="button"
                >
                    <span>Search commands</span>
                    <kbd class="nd-command__kbd" data-command-shortcut>Ctrl K</kbd>
                </button>
                <div data-part="content">
                    <h2 data-part="title" class="nd-command__title">Command palette</h2>
                    <p data-part="description" class="nd-command__description">
                        Type to filter, then press Enter to run a command.
                    </p>

                    <nd-combobox class="nd-command__combobox" inline>
                        <label data-part="label" class="nd-command__label">Commands</label>
                        <div data-part="control">
                            <input data-part="input" placeholder="Type a command…" />
                        </div>
                        <div data-part="positioner">
                            <div data-part="content">
                                ${commands.map(
                                    (command) =>
                                        html`<div data-part="item" data-value=${command.value}>
                                            <span data-part="item-text">${command.label}</span>
                                            <span data-part="item-indicator" aria-hidden="true">↵</span>
                                        </div>`
                                )}
                            </div>
                        </div>
                    </nd-combobox>

                    <p class="nd-command__empty" data-command-empty role="status" aria-live="polite" hidden>
                        No commands found.
                    </p>
                    <button
                        class="nd-command__close"
                        data-variant="ghost"
                        data-size="sm"
                        data-part="close-trigger"
                        type="button"
                        aria-label="Close command palette"
                    >
                        ×
                    </button>
                </div>
            </nd-dialog>
        </div>
    `,
} satisfies Meta<CommandArgs>;

export default meta;
type Story = StoryObj<CommandArgs>;

/** Closed palette, wired and ready for Cmd/Ctrl+K. */
export const Default: Story = {
    play: ({ canvasElement }) => {
        initCommandPalette(canvasElement);
    },
};

/** Opened palette showing the filtered listbox and empty state wiring. */
export const Open: Story = {
    play: ({ canvasElement }) => {
        initCommandPalette(canvasElement)?.open();
    },
};

/** Only two commands, so the empty state is easy to reach by typing. */
export const ShortList: Story = {
    args: { commands: COMMANDS.slice(0, 2) },
    play: ({ canvasElement }) => {
        initCommandPalette(canvasElement)?.open();
    },
};
