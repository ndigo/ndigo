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
import { ensureRootElement } from '@/lib/structure-element';

let nextId = 0;

export class NdSlider extends NdElement {
    static observedAttributes = ['disabled', 'readonly', 'name', 'value', 'min', 'max', 'step'];

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
        this.#machineId ||= this.id || `nd-slider-${++nextId}`;
        ensureRootElement(this);
        this.#controller.start();
    }

    protected onDisconnect(): void {
        this.#controller.stop();
    }

    attributeChangedCallback(name: string, _previous: string | null, _value: string | null): void {
        if (name === 'value') {
            this.#controller.api?.setValue([this.#number('value', this.#number('min', 0))]);
            return;
        }
        this.#controller.updateProps({
            min: this.#number('min', 0),
            max: this.#number('max', 100),
            step: this.#number('step', 1),
            disabled: this.hasAttribute('disabled'),
            readOnly: this.hasAttribute('readonly'),
            name: this.getAttribute('name') ?? undefined,
        });
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
