/**
 * `@toolMapping` metadata: storage, defaults, and validation.
 */
import { describe, expect, it } from 'vitest';
import { getToolMapping, toolMapping } from '../src/tool-mapping';

describe('@toolMapping', () => {
    it('records method metadata on the class', () => {
        class Controller {
            @toolMapping({ name: 'get_order', description: 'Get one order', readOnly: true })
            getOrder(): void {}

            plain(): void {}
        }

        expect(getToolMapping(Controller, 'getOrder')).toEqual({
            name: 'get_order',
            description: 'Get one order',
            readOnly: true,
        });
        expect(getToolMapping(Controller, 'plain')).toBeUndefined();
    });

    it('reads metadata from an instance', () => {
        class Controller {
            @toolMapping()
            run(): void {}
        }

        expect(getToolMapping(new Controller(), 'run')).toEqual({});
    });

    it('validates and stores the MCP Apps resource URI', () => {
        expect(() => toolMapping({ ui: 'https://example.test/app' })).toThrow(/ui:\/\//u);
        expect(() => toolMapping({ ui: 'ui://orders' })).not.toThrow();

        class Controller {
            @toolMapping({ ui: 'ui://orders' })
            render(): void {}
        }
        expect(getToolMapping(Controller, 'render')).toEqual({ ui: 'ui://orders' });
    });

    it('rejects a non-snake-case tool name at decoration time', () => {
        expect(() => toolMapping({ name: 'GetOrder' })).toThrow(/snake_case/u);
        expect(() => toolMapping({ name: 'get-order' })).toThrow(/snake_case/u);
        expect(() => toolMapping({ name: '9order' })).toThrow(/snake_case/u);
        expect(() => toolMapping({ name: 'get_order' })).not.toThrow();
    });
});
