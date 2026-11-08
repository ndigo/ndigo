/**
 * Dependency pin guard for the Zag.js spike.
 */
import { INIT_STATE } from '@zag-js/core';
import { machine as dialogMachine } from '@zag-js/dialog';
import { machine as menuMachine } from '@zag-js/menu';
import { normalizeProps } from '@zag-js/vanilla';
import { describe, expect, it } from 'vitest';

describe('Zag.js 1.x pin', () => {
    it('exposes the dialog and menu machines used by the elements', () => {
        expect(dialogMachine.states.open).toBeDefined();
        expect(menuMachine.states.open).toBeDefined();
        expect(typeof INIT_STATE).toBe('string');
    });

    it('normalizes props without a framework runtime', () => {
        expect(normalizeProps.element({ id: 'nd-spike' })).toMatchObject({ id: 'nd-spike' });
    });
});
