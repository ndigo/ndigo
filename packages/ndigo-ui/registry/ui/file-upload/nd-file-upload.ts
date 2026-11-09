/**
 * `<nd-file-upload>` — dropzone and file list built on the Zag.js file-upload
 * machine.
 *
 * The authored dropzone opens the picker and accepts drops; the machine owns
 * validation, the hidden file input, and the accepted file list.
 */
import { connect as connectFileUpload, machine as fileUploadMachine } from '@zag-js/file-upload';
import type { Api as FileUploadApi, FileMimeType } from '@zag-js/file-upload';
import { normalizeProps, spreadProps } from '@zag-js/vanilla';
import { defineElement, NdElement } from '@/lib/base-element';
import { createZagElement } from '@/lib/zag-element';

const DEFAULT_MAX_FILES = 1;
const DEFAULT_MAX_FILE_SIZE = Number.POSITIVE_INFINITY;
const DEFAULT_MIN_FILE_SIZE = 0;
const BYTE_UNITS = ['KB', 'MB', 'GB'] as const;

let nextId = 0;

export class NdFileUpload extends NdElement {
    #machineId = '';
    #controller = createZagElement({
        machine: fileUploadMachine,
        connect: (service): FileUploadApi => connectFileUpload(service, normalizeProps),
        props: () => ({
            id: this.#machineId,
            name: this.getAttribute('name') ?? undefined,
            // The attribute is an accept list string (`image/*,.pdf`); the
            // machine normalizes it for the input's accept attribute.
            accept: (this.getAttribute('accept') as FileMimeType | null) ?? undefined,
            maxFiles: this.#numberAttribute('max-files', DEFAULT_MAX_FILES),
            maxFileSize: this.#numberAttribute('max-file-size', DEFAULT_MAX_FILE_SIZE),
            minFileSize: this.#numberAttribute('min-file-size', DEFAULT_MIN_FILE_SIZE),
            disabled: this.hasAttribute('disabled'),
            required: this.hasAttribute('required'),
            readOnly: this.hasAttribute('readonly'),
            invalid: this.hasAttribute('invalid'),
            onFileChange: (details) => {
                this.dataset.value = details.acceptedFiles.map((file) => file.name).join(', ');
                this.dataset.count = String(details.acceptedFiles.length);
                this.emit('file-change', details);
            },
        }),
        render: (api) => this.#render(api),
    });

    protected onConnect(): void {
        this.#machineId = this.id || `nd-file-upload-${++nextId}`;
        this.#ensureHiddenInput();
        this.#ensureItemGroup();
        this.#controller.start();
        const files = this.#controller.api?.acceptedFiles ?? [];
        this.dataset.value = files.map((file) => file.name).join(', ');
        this.dataset.count = String(files.length);
    }

    protected onDisconnect(): void {
        this.#controller.stop();
    }

    /** Opens the browser file picker. */
    openFilePicker(): void {
        this.#controller.api?.openFilePicker();
    }

    /** Removes every accepted file. */
    clear(): void {
        this.#controller.api?.clearFiles();
    }

    #numberAttribute(name: string, fallback: number): number {
        const raw = this.getAttribute(name);
        if (raw === null) return fallback;
        const value = Number(raw);
        return Number.isFinite(value) && value >= 0 ? value : fallback;
    }

    #ensureHiddenInput(): void {
        if (this.querySelector('[data-part="hidden-input"]')) return;
        const input = this.ownerDocument.createElement('input');
        input.type = 'file';
        input.hidden = true;
        input.dataset.part = 'hidden-input';
        this.append(input);
    }

    #ensureItemGroup(): void {
        if (this.querySelector('[data-part="item-group"]')) return;
        const group = this.ownerDocument.createElement('ul');
        group.dataset.part = 'item-group';
        const clear = this.querySelector('[data-part="clear-trigger"]');
        if (clear) clear.before(group);
        else this.append(group);
    }

    #formatSize(bytes: number): string {
        if (bytes < 1024) return `${bytes} B`;
        let value = bytes / 1024;
        let unit = 0;
        while (value >= 1024 && unit < BYTE_UNITS.length - 1) {
            value /= 1024;
            unit += 1;
        }
        return `${value.toFixed(1)} ${BYTE_UNITS[unit]}`;
    }

    #createItem(api: FileUploadApi, file: File): HTMLElement {
        const item = this.ownerDocument.createElement('li');
        item.dataset.part = 'item';
        spreadProps(item, api.getItemProps({ file }));

        const name = this.ownerDocument.createElement('span');
        name.dataset.part = 'item-name';
        name.textContent = file.name;
        spreadProps(name, api.getItemNameProps({ file }));

        const size = this.ownerDocument.createElement('span');
        size.dataset.part = 'item-size-text';
        size.textContent = this.#formatSize(file.size);
        spreadProps(size, api.getItemSizeTextProps({ file }));

        const remove = this.ownerDocument.createElement('button');
        remove.type = 'button';
        remove.dataset.part = 'item-delete-trigger';
        remove.textContent = '×';
        spreadProps(remove, api.getItemDeleteTriggerProps({ file }));

        item.append(name, size, remove);
        return item;
    }

    #render(api: FileUploadApi): void {
        spreadProps(this, api.getRootProps());
        const label = this.querySelector<HTMLElement>('[data-part="label"]');
        const dropzone = this.querySelector<HTMLElement>('[data-part="dropzone"]');
        const trigger = this.querySelector<HTMLElement>('[data-part="trigger"]');
        const clear = this.querySelector<HTMLElement>('[data-part="clear-trigger"]');
        const hidden = this.querySelector<HTMLElement>('[data-part="hidden-input"]');
        const group = this.querySelector<HTMLElement>('[data-part="item-group"]');

        if (label) spreadProps(label, api.getLabelProps());
        if (dropzone) spreadProps(dropzone, api.getDropzoneProps());
        if (trigger) spreadProps(trigger, api.getTriggerProps());
        if (clear) spreadProps(clear, api.getClearTriggerProps());
        if (hidden) spreadProps(hidden, api.getHiddenInputProps());
        if (group) {
            spreadProps(group, api.getItemGroupProps());
            group.replaceChildren(...api.acceptedFiles.map((file) => this.#createItem(api, file)));
        }
    }
}

defineElement('nd-file-upload', NdFileUpload);
