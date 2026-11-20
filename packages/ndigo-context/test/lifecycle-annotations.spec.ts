import { describe, test, expect, vi } from 'vitest';
import { GenericApplicationContext } from '../src/context';
import { MockEnvironment } from '../src/environment';
import { hashScope, refreshScope } from '@ndigo/factory';
import { preDestroy, preInit } from '@ndigo/factory';

describe('lifecycle annotations via context', () => {
    test('RefreshScope.clear runs @preDestroy', () => {
        const beforeDestroy = vi.fn();

        @refreshScope
        class RefreshScoped {
            @preDestroy()
            bd(): void {
                beforeDestroy();
            }
        }

        const env = new MockEnvironment();
        const context = new GenericApplicationContext('test');
        context.setEnvironment(env);
        context.setValue('resh', RefreshScoped);
        context.refresh();
        context.getValue('resh');

        env.refresh(); // emits config:refresh → scope.clear()

        expect(beforeDestroy).toHaveBeenCalled();
        context.destroy();
    });

    test('context close runs @preDestroy', () => {
        const beforeDestroy = vi.fn();

        class Plain {
            @preDestroy()
            bd(): void {
                beforeDestroy();
            }
        }

        const context = new GenericApplicationContext('test');
        context.setValue('plain', Plain);
        context.getValue('plain');
        context.refresh();
        context.close();

        expect(beforeDestroy).toHaveBeenCalled();
    });

    test('hashScope endScope runs @preDestroy', () => {
        const beforeDestroy = vi.fn();

        @hashScope
        class HashScoped {
            @preDestroy()
            bd(): void {
                beforeDestroy();
            }
        }

        const context = new GenericApplicationContext('test');
        context.setValue('hash', HashScoped);
        context.refresh();
        const scope = context.getScope('hash') as unknown as {
            setCurrentKey: (k: string) => void;
            endScope: (k: string) => void;
        };
        scope.setCurrentKey('k1');
        context.getValue('hash');
        scope.endScope('k1');

        expect(beforeDestroy).toHaveBeenCalled();
        context.destroy();
    });

    test('@preInit runs with injected aware state', () => {
        const seen: { hasContext?: boolean } = {};

        class AwareTarget {
            #ctx: unknown;
            setApplicationContext(ctx: unknown): void {
                this.#ctx = ctx;
            }

            @preInit()
            check(): void {
                seen.hasContext = this.#ctx !== undefined;
            }
        }

        const context = new GenericApplicationContext('test');
        context.setValue('aware', AwareTarget);
        context.refresh();
        context.getValue('aware');

        expect(seen.hasContext).toBe(true);
        context.destroy();
    });
});
