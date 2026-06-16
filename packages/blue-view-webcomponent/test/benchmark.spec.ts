import { describe, it, expect } from 'vitest';
import { BenchmarkHarness } from '../../../../todomvc/examples/bluejs/src/benchmark';

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

        const harness = new BenchmarkHarness();
        
        // Mock window.parent to capture the result
        const parentMock = {
            postMessage: (message: any) => {
                if (message.type === 'suite-complete') {
                    window.dispatchEvent(new CustomEvent('benchmark-done', { detail: message.result }));
                }
            }
        };
        (window as any).parent = parentMock;

        // Trigger the benchmark
        window.postMessage({ 
            id: "todomvc-bluejs-1.0.0",
            key: "benchmark-connector", 
            type: "benchmark-suite",
            name: "Speedometer 3"
        }, '*');

        // Wait for the result
        const result = await new Promise((resolve) => {
            window.addEventListener('benchmark-done', (e: any) => resolve(e.detail), { once: true });
        });

        console.log('Benchmark Results:', result);
        expect(result).toBeDefined();
        expect(result.total).toBeGreaterThan(0);
    });
});
