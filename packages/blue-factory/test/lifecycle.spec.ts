/**
 * @module blue-factory
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import {
    likeDestroyable,
    likeInitializable,
    likeCloseable,
    likeLifecycle,
    likePhased,
    likeSmartLifecycle,
    DefaultLifecycleProcessor,
} from '../src/lifecycle';
import { DefaultFactory } from '../src/factory';

describe('likeDestroyable', () => {
    test('it should identify destroyables', () => {
        expect(likeDestroyable({ destroy: () => void 0, destroyed: false })).toBe(true);
    });
});

describe('likeInitializable', () => {
    test('it should identify initializables', () => {
        expect(likeInitializable({ init: () => void 0 })).toBe(true);
    });
});

describe('likeCloseable', () => {
    test('it should identify closeables', () => {
        expect(likeCloseable({ close: () => void 0 })).toBe(true);
    });
});

describe('likeLifecycle', () => {
    test('it should identify lifecycle values', () => {
        expect(likeLifecycle({ isRunning: false, start: () => void 0, stop: () => void 0 })).toBe(true);
    });
});

describe('likePhased', () => {
    test('it should identify phased values', () => {
        expect(likePhased({ phase: 1 })).toBe(true);
    });
});

describe('likeSmartLifecycle', () => {
    test('it should identify smart lifecycle values', () => {
        expect(
            likeSmartLifecycle({
                isRunning: false,
                start: () => void 0,
                stop: () => void 0,
                phase: 0,
                isAutoStartup: true,
            })
        ).toBe(true);
    });
});

describe('DefaultLifecycleProcessor', () => {
    class SmartLifecycleTarget {
        #running = false;

        readonly isAutoStartup: boolean;
        readonly phase: number;
        readonly events: string[];

        get isRunning(): boolean {
            return this.#running;
        }

        constructor(phase: number, isAutoStartup: boolean = true) {
            this.phase = phase;
            this.isAutoStartup = isAutoStartup;
            this.events = [];
        }

        start(): void {
            this.events.push(`start:${this.phase}`);
            this.#running = true;
        }

        stop(): void {
            this.events.push(`stop:${this.phase}`);
            this.#running = false;
        }
    }

    test('it should start smart lifecycle values in phase order', () => {
        const factory = new DefaultFactory();
        const processor = new DefaultLifecycleProcessor();

        const phase2 = new SmartLifecycleTarget(2);
        const phase1 = new SmartLifecycleTarget(1);

        factory.setValue('phase2', phase2);
        factory.setValue('phase1', phase1);

        processor.onRefresh(factory);

        expect(processor.isRunning).toBe(true);
        expect(phase1.events).toStrictEqual(['start:1']);
        expect(phase2.events).toStrictEqual(['start:2']);
    });

    test('it should stop smart lifecycle values in reverse phase order', () => {
        const factory = new DefaultFactory();
        const processor = new DefaultLifecycleProcessor();

        const phase2 = new SmartLifecycleTarget(2);
        const phase1 = new SmartLifecycleTarget(1);

        factory.setValue('phase2', phase2);
        factory.setValue('phase1', phase1);

        processor.onRefresh(factory);
        processor.onClose(factory);

        expect(processor.isRunning).toBe(false);
        expect(phase2.events).toStrictEqual(['start:2', 'stop:2']);
        expect(phase1.events).toStrictEqual(['start:1', 'stop:1']);
    });

    test('it should skip auto startup when disabled', () => {
        const factory = new DefaultFactory();
        const processor = new DefaultLifecycleProcessor();

        const manual = new SmartLifecycleTarget(1, false);

        factory.setValue('manual', manual);

        processor.onRefresh(factory);

        expect(manual.events).toStrictEqual([]);
        expect(manual.isRunning).toBe(false);
    });
});
