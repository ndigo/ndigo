/**
 * Command palette block glue.
 *
 * Composes `<nd-dialog>` and `<nd-combobox>`: Cmd/Ctrl+K opens the dialog, the
 * combobox filters and selects, and the block re-emits the choice as
 * `nd-command`. Keep this file next to the markup and stylesheets; it carries
 * no imports so it can be copied into any bundler setup.
 */

/** Payload of the `nd-command` event. */
export interface CommandSelection {
    /** The `data-value` of the chosen item. */
    readonly value: string;
    /** The visible label of the chosen item. */
    readonly label: string;
}

interface CommandDialogElement extends HTMLElement {
    show(): void;
    hide(): void;
}

interface CommandComboboxElement extends HTMLElement {
    show(): void;
    hide(): void;
    clear(): void;
}

/** Handle returned by {@link initCommandPalette}. */
export interface CommandPalette {
    readonly root: HTMLElement;
    open(): void;
    close(): void;
    destroy(): void;
}

const SHORTCUT_KEY = 'k';

/**
 * Wires one command palette rendered from `command.html`.
 * @param root - Document or container that holds the `[data-command]` block.
 * @returns The palette handle, or `null` when the markup is absent.
 */
export function initCommandPalette(root: ParentNode): CommandPalette | null {
    const container = root.querySelector<HTMLElement>('[data-command]');
    if (container === null) return null;

    const dialog = container.querySelector<CommandDialogElement>('nd-dialog');
    const combobox = container.querySelector<CommandComboboxElement>('nd-combobox');
    if (dialog === null || combobox === null) return null;

    const input = combobox.querySelector<HTMLInputElement>('[data-part="input"]');
    const empty = container.querySelector<HTMLElement>('[data-command-empty]');
    const shortcut = container.querySelector<HTMLElement>('[data-command-shortcut]');

    if (shortcut !== null) shortcut.textContent = isApplePlatform() ? '⌘K' : 'Ctrl K';

    const items = (): HTMLElement[] => [...combobox.querySelectorAll<HTMLElement>('[data-part="item"]')];

    const visibleItems = (): HTMLElement[] => items().filter((item) => !item.hidden);

    const syncEmptyState = (): void => {
        if (empty !== null) empty.hidden = visibleItems().length > 0;
    };

    const labelFor = (value: string): string => {
        const item = items().find((candidate) => candidate.dataset.value === value);
        return item?.querySelector<HTMLElement>('[data-part="item-text"]')?.textContent?.trim() ?? value;
    };

    const open = (): void => {
        dialog.show();
        combobox.show();
        input?.focus();
        syncEmptyState();
    };

    const close = (): void => {
        combobox.hide();
        dialog.hide();
    };

    const onKeydown = (event: KeyboardEvent): void => {
        if (event.key.toLowerCase() !== SHORTCUT_KEY || !(event.metaKey || event.ctrlKey)) return;
        event.preventDefault();
        if (dialog.hasAttribute('open')) {
            input?.focus();
            return;
        }
        open();
    };

    const onOpenChange = (event: Event): void => {
        const { open: isOpen } = (event as CustomEvent<{ open: boolean }>).detail;
        if (isOpen) {
            combobox.show();
            syncEmptyState();
            return;
        }
        combobox.hide();
        combobox.clear();
        syncEmptyState();
    };

    const onValueChange = (event: Event): void => {
        const { value } = (event as CustomEvent<{ value: string[] }>).detail;
        const selected = value[0];
        if (selected === undefined) return;
        close();
        container.dispatchEvent(
            new CustomEvent<CommandSelection>('nd-command', {
                detail: { value: selected, label: labelFor(selected) },
                bubbles: true,
                composed: true,
            })
        );
    };

    const onInput = (): void => {
        // The combobox machine applies the filter in a microtask queued by its
        // input handler, so read the item state after that turn.
        queueMicrotask(syncEmptyState);
    };

    const ownerDocument = container.ownerDocument;
    ownerDocument.addEventListener('keydown', onKeydown);
    dialog.addEventListener('nd-open-change', onOpenChange);
    combobox.addEventListener('nd-value-change', onValueChange);
    combobox.addEventListener('input', onInput);

    return {
        root: container,
        open,
        close,
        destroy(): void {
            ownerDocument.removeEventListener('keydown', onKeydown);
            dialog.removeEventListener('nd-open-change', onOpenChange);
            combobox.removeEventListener('nd-value-change', onValueChange);
            combobox.removeEventListener('input', onInput);
        },
    };
}

function isApplePlatform(): boolean {
    return typeof navigator !== 'undefined' && /Mac|iPhone|iPad/u.test(navigator.platform);
}
