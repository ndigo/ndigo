/**
 * `<nd-date-picker>` — popup calendar built on the Zag.js date-picker machine.
 *
 * The chrome (input, trigger, view controls) is authored; the calendar grid is
 * generated from the machine's weeks. A hidden input carries the ISO value so
 * forms submit `YYYY-MM-DD` rather than the localized display text.
 */
import { parseDate } from '@internationalized/date';
import { connect as connectDatePicker, machine as datePickerMachine } from '@zag-js/date-picker';
import type { Api as DatePickerApi, DateValue } from '@zag-js/date-picker';
import { normalizeProps, spreadProps } from '@zag-js/vanilla';
import { defineElement, NdElement } from '@/lib/base-element';
import { createZagElement } from '@/lib/zag-element';

let nextId = 0;

export class NdDatePicker extends NdElement {
    static observedAttributes = ['open'];

    #machineId = '';
    #controller = createZagElement({
        machine: datePickerMachine,
        connect: (service): DatePickerApi => connectDatePicker(service, normalizeProps),
        props: () => ({
            id: this.#machineId,
            locale: this.getAttribute('locale') ?? 'en-US',
            defaultValue: this.#initialValue(),
            min: this.#parseIso(this.getAttribute('min')),
            max: this.#parseIso(this.getAttribute('max')),
            disabled: this.hasAttribute('disabled'),
            readOnly: this.hasAttribute('readonly'),
            required: this.hasAttribute('required'),
            invalid: this.hasAttribute('invalid'),
            open: this.hasAttribute('open'),
            closeOnSelect: true,
            minView: 'day' as const,
            maxView: 'day' as const,
            onOpenChange: (details) => {
                this.toggleAttribute('open', details.open);
                this.emit('open-change', details);
            },
            onValueChange: (details) => {
                const iso = details.value.map((date) => date.toString());
                this.dataset.value = iso.join(',');
                this.#syncHiddenInput(iso);
                this.emit('value-change', { ...details, valueAsString: iso });
            },
        }),
        render: (api) => this.#render(api),
    });

    protected onConnect(): void {
        this.#machineId = this.id || `nd-date-picker-${++nextId}`;
        this.#ensureStructure();
        this.#controller.start();
        const value = this.#controller.api?.value.map((date) => date.toString()) ?? [];
        this.dataset.value = value.join(',');
        this.#syncHiddenInput(value);
    }

    protected onDisconnect(): void {
        this.#controller.stop();
    }

    attributeChangedCallback(name: string, _previous: string | null, value: string | null): void {
        if (name === 'open') this.#controller.updateProps({ open: value !== null });
    }

    /** Opens the calendar programmatically. */
    show(): void {
        this.#controller.api?.setOpen(true);
    }

    /** Closes the calendar programmatically. */
    hide(): void {
        this.#controller.api?.setOpen(false);
    }

    /** Clears the selected date. */
    clear(): void {
        this.#controller.api?.clearValue();
    }

    /** Selects one ISO date (`YYYY-MM-DD`) programmatically. */
    select(value: string): void {
        const date = this.#parseIso(value);
        if (date) this.#controller.api?.setValue([date]);
    }

    #initialValue(): DateValue[] | undefined {
        const date = this.#parseIso(this.getAttribute('value'));
        return date ? [date] : undefined;
    }

    #parseIso(value: string | null): DateValue | undefined {
        if (value === null || value.trim().length === 0) return undefined;
        try {
            return parseDate(value.trim());
        } catch {
            // Invalid ISO input is treated as absent rather than failing the element.
            return undefined;
        }
    }

    #syncHiddenInput(values: readonly string[]): void {
        const hidden = this.querySelector<HTMLInputElement>('[data-part="hidden-input"]');
        if (hidden) hidden.value = values[0] ?? '';
    }

    #ensureStructure(): void {
        const root = this.#ensureRoot();
        let content = this.querySelector<HTMLElement>('[data-part="content"]');
        let positioner = this.querySelector<HTMLElement>('[data-part="positioner"]');

        if (!content) {
            content = this.#createContent();
        }

        if (!positioner) {
            positioner = this.ownerDocument.createElement('div');
            positioner.dataset.part = 'positioner';
            content.replaceWith(positioner);
            positioner.append(content);
        }

        if (content.parentElement !== positioner) positioner.append(content);
        if (positioner.parentElement !== root) root.append(positioner);

        const table = content.querySelector<HTMLTableElement>('[data-part="table"]') ?? this.#createTable();
        if (table.parentElement !== content) content.append(table);
        if (!table.querySelector('[data-part="table-head"]')) {
            const head = this.ownerDocument.createElement('thead');
            head.dataset.part = 'table-head';
            table.prepend(head);
        }
        if (!table.querySelector('[data-part="table-body"]')) {
            const body = this.ownerDocument.createElement('tbody');
            body.dataset.part = 'table-body';
            table.append(body);
        }

        if (!root.querySelector('[data-part="hidden-input"]')) {
            const hidden = this.ownerDocument.createElement('input');
            hidden.type = 'hidden';
            hidden.dataset.part = 'hidden-input';
            hidden.name = this.getAttribute('name') ?? '';
            root.append(hidden);
        }
    }

    #ensureRoot(): HTMLElement {
        const existing = this.firstElementChild;
        if (existing instanceof HTMLElement && existing.dataset.part === 'root') return existing;
        const root = this.ownerDocument.createElement('div');
        root.dataset.part = 'root';
        root.append(...this.children);
        this.append(root);
        return root;
    }

    #createContent(): HTMLElement {
        const content = this.ownerDocument.createElement('div');
        content.dataset.part = 'content';
        content.append(this.#createViewControl());
        return content;
    }

    #createViewControl(): HTMLElement {
        const control = this.ownerDocument.createElement('div');
        control.dataset.part = 'view-control';
        const prev = this.ownerDocument.createElement('button');
        prev.type = 'button';
        prev.dataset.part = 'prev-trigger';
        prev.textContent = '‹';
        const label = this.ownerDocument.createElement('span');
        label.dataset.part = 'view-label';
        const next = this.ownerDocument.createElement('button');
        next.type = 'button';
        next.dataset.part = 'next-trigger';
        next.textContent = '›';
        control.append(prev, label, next);
        return control;
    }

    #createTable(): HTMLTableElement {
        const table = this.ownerDocument.createElement('table');
        table.dataset.part = 'table';
        const head = this.ownerDocument.createElement('thead');
        head.dataset.part = 'table-head';
        const body = this.ownerDocument.createElement('tbody');
        body.dataset.part = 'table-body';
        table.append(head, body);
        return table;
    }

    #render(api: DatePickerApi): void {
        const root = this.querySelector<HTMLElement>('[data-part="root"]');
        const label = this.querySelector<HTMLElement>('[data-part="label"]');
        const control = this.querySelector<HTMLElement>('[data-part="control"]');
        const input = this.querySelector<HTMLElement>('[data-part="input"]');
        const trigger = this.querySelector<HTMLElement>('[data-part="trigger"]');
        const clear = this.querySelector<HTMLElement>('[data-part="clear-trigger"]');
        const positioner = this.querySelector<HTMLElement>('[data-part="positioner"]');
        const content = this.querySelector<HTMLElement>('[data-part="content"]');
        const viewControl = content?.querySelector<HTMLElement>('[data-part="view-control"]');
        const prev = content?.querySelector<HTMLElement>('[data-part="prev-trigger"]');
        const next = content?.querySelector<HTMLElement>('[data-part="next-trigger"]');
        const viewLabel = content?.querySelector<HTMLElement>('[data-part="view-label"]');
        const table = content?.querySelector<HTMLElement>('[data-part="table"]');
        const head = content?.querySelector<HTMLElement>('[data-part="table-head"]');
        const body = content?.querySelector<HTMLElement>('[data-part="table-body"]');

        if (root) spreadProps(root, api.getRootProps());
        if (label) spreadProps(label, api.getLabelProps());
        if (control) spreadProps(control, api.getControlProps());
        if (input) spreadProps(input, api.getInputProps());
        if (trigger) spreadProps(trigger, api.getTriggerProps());
        if (clear) spreadProps(clear, api.getClearTriggerProps());
        if (positioner) spreadProps(positioner, api.getPositionerProps());
        if (content) spreadProps(content, api.getContentProps());
        if (viewControl) spreadProps(viewControl, api.getViewControlProps({ view: 'day' }));
        if (prev) spreadProps(prev, api.getPrevTriggerProps({ view: 'day' }));
        if (next) spreadProps(next, api.getNextTriggerProps({ view: 'day' }));
        if (viewLabel) viewLabel.textContent = api.visibleRangeText.formatted;
        if (table) spreadProps(table, api.getTableProps({ view: 'day' }));
        if (head) spreadProps(head, api.getTableHeadProps({ view: 'day' }));
        if (body) spreadProps(body, api.getTableBodyProps({ view: 'day' }));

        if (head) head.replaceChildren(this.#renderHeader(api));
        if (body) body.replaceChildren(...this.#renderWeeks(api));
    }

    #renderHeader(api: DatePickerApi): HTMLTableRowElement {
        const row = this.ownerDocument.createElement('tr');
        row.dataset.part = 'table-row';
        spreadProps(row, api.getTableRowProps({ view: 'day' }));
        for (const day of api.weekDays) {
            const cell = this.ownerDocument.createElement('th');
            cell.dataset.part = 'table-header';
            cell.scope = 'col';
            cell.textContent = day.short;
            spreadProps(cell, api.getTableHeaderProps({ view: 'day' }));
            row.append(cell);
        }
        return row;
    }

    #renderWeeks(api: DatePickerApi): HTMLTableRowElement[] {
        return api.weeks.map((week) => {
            const row = this.ownerDocument.createElement('tr');
            row.dataset.part = 'table-row';
            spreadProps(row, api.getTableRowProps({ view: 'day' }));
            for (const date of week) {
                const cell = this.ownerDocument.createElement('td');
                cell.dataset.part = 'table-cell';
                spreadProps(cell, api.getDayTableCellProps({ value: date }));
                const trigger = this.ownerDocument.createElement('button');
                trigger.type = 'button';
                trigger.dataset.part = 'table-cell-trigger';
                trigger.textContent = String(date.day);
                spreadProps(trigger, api.getDayTableCellTriggerProps({ value: date }));
                cell.append(trigger);
                row.append(cell);
            }
            return row;
        });
    }
}

defineElement('nd-date-picker', NdDatePicker);
