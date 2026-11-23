/**
 * The agent-bridge contract: a stub adapter satisfies the full surface, and
 * tool annotations survive registration unchanged.
 */
import { describe, expect, test } from 'vitest';
import type {
    AgentActResult,
    AgentBridge,
    AgentEntity,
    AgentQuery,
    AgentQueryMatch,
    AgentStep,
    AgentTool,
} from '../src/agent-bridge';

/**
 * A minimal in-memory adapter: one text entity with a `setValue` action, and a
 * tool registry that records what was registered.
 */
function createStubBridge(): { bridge: AgentBridge; registered: AgentTool[] } {
    let value = 'Apollo';
    const entity = (): AgentEntity => ({
        ref: 'c1',
        component: 'input',
        label: 'Project name',
        value,
        actions: ['setValue'],
    });
    const registered: AgentTool[] = [];
    const bridge: AgentBridge = {
        snapshot: () => [entity()],
        query: (query: AgentQuery): readonly AgentQueryMatch[] | { readonly error: string } => {
            if (query.text !== undefined && !'Project name'.toLowerCase().includes(query.text.toLowerCase())) {
                return { error: `no match for '${query.text}'` };
            }
            return [{ ref: 'c1', label: 'Project name' }];
        },
        act: async (steps: readonly AgentStep[]): Promise<AgentActResult> => {
            for (const [index, step] of steps.entries()) {
                if (step.ref !== 'c1' && step.ref !== 'Project name') {
                    return { ok: false, error: `no entity '${step.ref}'`, failedStep: index };
                }
                if (step.action === 'delete') {
                    return { ok: false, error: 'action denied by policy', failedStep: index };
                }
                if (step.action !== 'setValue') {
                    return { ok: false, error: `no action '${step.action}'`, failedStep: index };
                }
                value = String(step.args?.[0]);
            }
            return { ok: true };
        },
        registerTools: async (tools) => {
            registered.push(...tools);
            return {
                supported: true,
                dispose: () => {
                    registered.length = 0;
                },
            };
        },
    };
    return { bridge, registered };
}

describe('AgentBridge contract', () => {
    test('a stub adapter satisfies the full surface', async () => {
        const { bridge } = createStubBridge();
        expect(bridge.snapshot()).toEqual([
            { ref: 'c1', component: 'input', label: 'Project name', value: 'Apollo', actions: ['setValue'] },
        ]);

        const matches = bridge.query({ text: 'project' });
        expect(Array.isArray(matches) ? matches[0]?.ref : undefined).toBe('c1');

        const applied = await bridge.act([{ ref: 'Project name', action: 'setValue', args: ['Atlas'] }]);
        expect(applied).toEqual({ ok: true });
        expect(bridge.snapshot()[0]?.value).toBe('Atlas');

        const failed = await bridge.act([{ ref: 'missing', action: 'setValue' }]);
        expect(failed).toEqual({ ok: false, error: "no entity 'missing'", failedStep: 0 });
    });

    test('a denied action is a result, not an exception', async () => {
        const { bridge } = createStubBridge();
        const denied = await bridge.act([{ ref: 'c1', action: 'delete' }]);
        expect(denied).toEqual({ ok: false, error: 'action denied by policy', failedStep: 0 });
        expect(bridge.snapshot()[0]?.value).toBe('Apollo');
    });

    test('an unservable query returns an error payload', () => {
        const { bridge } = createStubBridge();
        expect(bridge.query({ text: 'invoice' })).toEqual({ error: "no match for 'invoice'" });
    });

    test('tool annotations survive registration and disposal', async () => {
        const { bridge, registered } = createStubBridge();
        const tool: AgentTool = {
            name: 'set_project_name',
            description: 'Set the project name.',
            inputSchema: { type: 'object', properties: { value: { type: 'string' } } },
            annotations: {
                readOnlyHint: true,
                untrustedContentHint: true,
                consequentialHint: false,
                debugging: true,
            },
            execute: () => undefined,
        };

        const registration = await bridge.registerTools([tool]);
        expect(registration.supported).toBe(true);
        expect(registered).toHaveLength(1);
        expect(registered[0]?.annotations).toEqual({
            readOnlyHint: true,
            untrustedContentHint: true,
            consequentialHint: false,
            debugging: true,
        });

        registration.dispose();
        expect(registered).toHaveLength(0);
    });
});
