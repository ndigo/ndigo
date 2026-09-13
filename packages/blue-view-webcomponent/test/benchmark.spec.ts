import { describe, it, expect, vi } from 'vitest';
import { BenchmarkHarness } from '../../../../todomvc/examples/bluejs/src/benchmark';
import { TodoStateService } from '../../../../todomvc/examples/bluejs/src/state';

// jsdom never fires requestAnimationFrame, which the harness awaits once per
// benchmark step — fire it synchronously so the suite completes.
vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0);
    return 0;
});

describe('TodoMVC Benchmark', () => {
    it('should run the benchmark suite', async () => {
        // Setup DOM for the benchmark
        document.body.innerHTML = `
            <section class="todoapp">
                <header class="header">
                    <input class="new-todo" placeholder="What needs to be done?">
                </header>
                <section class="main">
                    <ul class="todo-list"></ul>
                </section>
            </section>
        `;

        const harness = new BenchmarkHarness(new TodoStateService());

        // Mock window.parent to capture the result
        const parentMock = {
            postMessage: (message: { type: string; result?: unknown }) => {
                if (message.type === 'suite-complete') {
                    window.dispatchEvent(new CustomEvent('benchmark-done', { detail: message.result }));
                }
            },
        };
        // window.parent is readonly in the DOM types; the harness posts its results through it.
        const benchmarkWindow = window as { parent: unknown };
        benchmarkWindow.parent = parentMock;

        // Trigger the benchmark
        window.postMessage(
            {
                id: 'todomvc-bluejs-1.0.0',
                key: 'benchmark-connector',
                type: 'benchmark-suite',
                name: 'Speedometer 3',
            },
            '*'
        );

        // Wait for the result
        const { promise, resolve } = Promise.withResolvers<{ total: number }>();
        window.addEventListener(
            'benchmark-done',
            (e: Event) => {
                const customEvent = e as CustomEvent; // the harness dispatches CustomEvents
                resolve(customEvent.detail);
            },
            { once: true }
        );

        const result = await promise;

        console.log('Benchmark Results:', result);
        expect(result).toBeDefined();
        expect(result.total).toBeGreaterThan(0);
    });
});
