/**
 * `<nd-slider>` — single-value range built on the Zag.js slider machine.
 *
 * Markup: a `[data-part="control"]` with a track/range and one or more
 * `[data-part="thumb"]` elements. A root wrapper is created when absent.
 */
import { connect as connectSlider, machine as sliderMachine } from '@zag-js/slider';
import type { Api as SliderApi } from '@zag-js/slider';
import { normalizeProps, spreadProps } from '@zag-js/vanilla';
import { defineElement, NdElement } from '@/lib/base-element';
import { createZagElement } from '@/lib/zag-element';

let nextId = 0;

export class NdSlider extends NdElement {
    #machineId = '';
    #controller = createZagElement({
        machine: sliderMachine,
        connect: (service) => connectSlider(service, normalizeProps),
        props: () => {
            const min = this.#number('min', 0);
            const max = this.#number('max', 100);
            return {
                id: this.#machineId,
                min,
                max,
                step: this.#number('step', 1),
                defaultValue: [this.#number('value', min)],
                disabled: this.hasAttribute('disabled'),
                readOnly: this.hasAttribute('readonly'),
                name: this.getAttribute('name') ?? undefined,
                onValueChange: (details) => {
                    this.dataset.value = String(details.value[0] ?? min);
                    this.emit('value-change', details);
                },
            };
        },
        render: (api) => this.#render(api),
    });

    protected onConnect(): void {
        this.#machineId = this.id || `nd-slider-${++nextId}`;
        this.#ensureRoot();
        this.#controller.start();
    }

    protected onDisconnect(): void {
        this.#controller.stop();
    }

    /** Sets the slider value. */
    setValue(value: number): void {
        this.#controller.api?.setValue([value]);
    }

    #number(name: string, fallback: number): number {
        const raw = this.getAttribute(name);
        if (raw === null) return fallback;
        const value = Number(raw);
        return Number.isFinite(value) ? value : fallback;
    }

    #ensureRoot(): HTMLElement {
        const existing = this.querySelector<HTMLElement>('[data-part="root"]');
        if (existing) return existing;
        const root = this.ownerDocument.createElement('div');
        root.dataset.part = 'root';
        root.append(...this.children);
        this.append(root);
        return root;
    }

    #render(api: SliderApi): void {
        const root = this.querySelector<HTMLElement>('[data-part="root"]');
        const label = this.querySelector<HTMLElement>('[data-part="label"]');
        const valueText = this.querySelector<HTMLElement>('[data-part="value-text"]');
        const control = this.querySelector<HTMLElement>('[data-part="control"]');
        const track = this.querySelector<HTMLElement>('[data-part="track"]');
        const range = this.querySelector<HTMLElement>('[data-part="range"]');

        if (root) spreadProps(root, api.getRootProps());
        if (label) spreadProps(label, api.getLabelProps());
        if (valueText) spreadProps(valueText, api.getValueTextProps());
        if (control) spreadProps(control, api.getControlProps());
        if (track) spreadProps(track, api.getTrackProps());
        if (range) spreadProps(range, api.getRangeProps());

        const thumbs = this.querySelectorAll<HTMLElement>('[data-part="thumb"]');
        thumbs.forEach((thumb, index) => {
            spreadProps(thumb, api.getThumbProps({ index }));
        });
    }
}

defineElement('nd-slider', NdSlider);
