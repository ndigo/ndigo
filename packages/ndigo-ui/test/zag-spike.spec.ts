/**
 * Dependency pin guard for the Zag.js spike.
 */
import { INIT_STATE } from '@zag-js/core';
import { machine as accordionMachine } from '@zag-js/accordion';
import { machine as popoverMachine } from '@zag-js/popover';
import { machine as dialogMachine } from '@zag-js/dialog';
import { machine as menuMachine } from '@zag-js/menu';
import { machine as sliderMachine } from '@zag-js/slider';
import { machine as switchMachine } from '@zag-js/switch';
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
        expect(typeof INIT_STATE).toBe('string');
    });

    it('normalizes props without a framework runtime', () => {
        expect(normalizeProps.element({ id: 'nd-spike' })).toMatchObject({ id: 'nd-spike' });
    });
});
