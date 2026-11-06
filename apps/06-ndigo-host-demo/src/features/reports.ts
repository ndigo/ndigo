/**
 * Reports feature module — lazy-loaded by the host via dynamic import.
 */
import type { ApplicationContext } from '@ndigo/context';

/**
 * Create the reports feature context.
 *
 * @param parent - The host shell context.
 * @returns A child context for the reports feature.
 */
export function createContext(parent: ApplicationContext): ApplicationContext {
    const ctx = parent.newChild('reports');
    ctx.setValue('reportData', [{ label: 'Signups', value: 42 }]);
    return ctx;
}
