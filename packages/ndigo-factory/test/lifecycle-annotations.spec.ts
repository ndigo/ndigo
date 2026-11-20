import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { DefaultFactory } from '../src/factory';
import { preInit, postInit, preDestroy, LifecycleAnnotationProcessor } from '../src/lifecycle-annotations';

describe('LifecycleAnnotationProcessor', () => {
    let factory: DefaultFactory;

    beforeEach(() => {
        factory = new DefaultFactory();
        factory.addProcessor(new LifecycleAnnotationProcessor());
    });

    afterEach(() => {
        factory = undefined as unknown as DefaultFactory;
    });

    test('runs @preInit before init and @postInit after init', () => {
        const order: string[] = [];

        class Target {
            init(): void {
                order.push('init');
            }

            @preInit()
            beforeInit(): void {
                order.push('preInit');
            }

            @postInit()
            afterInit(): void {
                order.push('postInit');
            }
        }

        factory.setValue('target', Target);
        const instance = factory.getValue<Target>('target');

        expect(instance).toBeInstanceOf(Target);
        expect(order).toEqual(['preInit', 'init', 'postInit']);
    });

    test('runs @preDestroy before destroy on destroyValue', () => {
        const order: string[] = [];

        class Target {
            destroyed = false;
            destroy(): void {
                order.push('destroy');
                this.destroyed = true;
            }

            @preDestroy()
            beforeDestroy(): void {
                order.push('preDestroy');
            }
        }

        factory.setValue('target', Target);
        factory.getValue<Target>('target');
        factory.destroyValue('target');

        expect(order).toEqual(['preDestroy', 'destroy']);
    });

    test('standalone instances are inert', () => {
        const beforeInit = vi.fn();
        const afterInit = vi.fn();
        const beforeDestroy = vi.fn();

        class Target {
            @preInit()
            bi(): void {
                beforeInit();
            }

            @postInit()
            ai(): void {
                afterInit();
            }

            @preDestroy()
            bd(): void {
                beforeDestroy();
            }
        }

        const instance = new Target();
        expect(beforeInit).not.toHaveBeenCalled();
        expect(afterInit).not.toHaveBeenCalled();
        void instance;
        expect(beforeDestroy).not.toHaveBeenCalled();
    });

    test('@preInit sees populated and injected state', () => {
        const seen: { value?: unknown } = {};

        class Target {
            name = 'hello';

            @preInit()
            check(): void {
                seen.value = this.name;
            }
        }

        factory.setValue('target', Target);
        factory.getValue<Target>('target');

        expect(seen.value).toBe('hello');
    });

    test('fail-loud: @preInit failure propagates', () => {
        class Target {
            @preInit()
            boom(): void {
                throw new Error('boom');
            }
        }

        factory.setValue('target', Target);
        expect(() => factory.getValue<Target>('target')).toThrow('boom');
    });

    test('standalone new instance does not run hooks even after destroy', () => {
        const beforeDestroy = vi.fn();

        class Target {
            @preDestroy()
            bd(): void {
                beforeDestroy();
            }
        }

        const instance = new Target();
        expect(beforeDestroy).not.toHaveBeenCalled();
        void instance;
    });
});
