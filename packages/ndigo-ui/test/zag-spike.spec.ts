/**
 * Dependency pin guard for the Zag.js spike.
 */
import { parseDate } from '@internationalized/date';
import { ListCollection } from '@zag-js/collection';
import { INIT_STATE } from '@zag-js/core';
import { machine as accordionMachine } from '@zag-js/accordion';
import { machine as comboboxMachine } from '@zag-js/combobox';
import { machine as datePickerMachine } from '@zag-js/date-picker';
import { machine as popoverMachine } from '@zag-js/popover';
import { machine as scrollAreaMachine } from '@zag-js/scroll-area';
import { machine as selectMachine } from '@zag-js/select';
import { machine as dialogMachine } from '@zag-js/dialog';
import { machine as fileUploadMachine } from '@zag-js/file-upload';
import { machine as menuMachine } from '@zag-js/menu';
import { machine as navigationMenuMachine } from '@zag-js/navigation-menu';
import { machine as sliderMachine } from '@zag-js/slider';
import { machine as switchMachine } from '@zag-js/switch';
import { machine as tagsInputMachine } from '@zag-js/tags-input';
import { machine as tabsMachine } from '@zag-js/tabs';
import { machine as tooltipMachine } from '@zag-js/tooltip';
import { normalizeProps } from '@zag-js/vanilla';
import { describe, expect, it } from 'vitest';

describe('Zag.js 1.x pin', () => {
    it('exposes the dialog and menu machines used by the elements', () => {
        expect(dialogMachine.states.open).toBeDefined();
        expect(menuMachine.states.open).toBeDefined();
        expect(popoverMachine.states.open).toBeDefined();
        expect(tooltipMachine.states.open).toBeDefined();
        expect(typeof tabsMachine.initialState).toBe('function');
        expect(typeof accordionMachine.initialState).toBe('function');
        expect(typeof switchMachine.initialState).toBe('function');
        expect(typeof sliderMachine.initialState).toBe('function');
        expect(typeof selectMachine.initialState).toBe('function');
        expect(typeof comboboxMachine.initialState).toBe('function');
        expect(typeof datePickerMachine.initialState).toBe('function');
        expect(typeof scrollAreaMachine.initialState).toBe('function');
        expect(typeof navigationMenuMachine.initialState).toBe('function');
        expect(typeof tagsInputMachine.initialState).toBe('function');
        expect(typeof fileUploadMachine.initialState).toBe('function');
        expect(parseDate('2026-11-09').toString()).toBe('2026-11-09');
        expect(new ListCollection({ items: ['a'] }).items).toEqual(['a']);
        expect(typeof INIT_STATE).toBe('string');
    });

    it('normalizes props without a framework runtime', () => {
        expect(normalizeProps.element({ id: 'nd-spike' })).toMatchObject({ id: 'nd-spike' });
    });
});
