import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const dom = new JSDOM(
    '<!DOCTYPE html><html><body><section class="todoapp"><header class="header"><h1>todos</h1><input class="new-todo" placeholder="What needs to be done?" autofocus/></header><main class="main"><div class="toggle-all-container"><input class="toggle-all" type="checkbox"/> <label class="toggle-all-label" for="toggle-all">Mark all as complete</label></div><ul class="todo-list"></ul></main><footer class="footer"><span class="todo-count"></span><ul class="filters"><li><a href="#/" class="selected">All</a></li><li><a href="#/active">Active</a></li><li><a href="#/completed">Completed</a></li></ul><button class="clear-completed">Clear completed</button></footer></section></body></html>',
    {
        url: 'http://localhost',
        pretendToBeVisual: true,
        resources: 'usable',
        runScripts: 'dangerously',
    }
);

/** Node's types don't declare the jsdom surface on globalThis — install it typed. */
const jsdomGlobals: Record<string, unknown> = globalThis as unknown as Record<string, unknown>;

jsdomGlobals.window = dom.window;
jsdomGlobals.document = dom.window.document;
jsdomGlobals.HTMLElement = dom.window.HTMLElement;
jsdomGlobals.Element = dom.window.Element;
jsdomGlobals.Node = dom.window.Node;
jsdomGlobals.localStorage = dom.window.localStorage;
jsdomGlobals.Event = dom.window.Event;
jsdomGlobals.KeyboardEvent = dom.window.KeyboardEvent;

const window = dom.window;
/** Window slots the DOM types mark readonly — polyfilled here. */
const windowSlots: Record<string, unknown> = window as unknown as Record<string, unknown>;

if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 16) as unknown as number;
}
jsdomGlobals.requestAnimationFrame = window.requestAnimationFrame.bind(window);

if (!window.performance?.now) {
    windowSlots.performance = { now: () => Date.now() };
}

const webcrypto = jsdomGlobals.crypto as { randomUUID?: () => string } | undefined;
if (!webcrypto?.randomUUID) {
    jsdomGlobals.crypto = {
        randomUUID: () =>
            'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
                const r = (Math.random() * 16) | 0;
                const v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            }),
    };
}

windowSlots.parent = {
    postMessage: (message: unknown, _targetOrigin: string) => {
        const frame = message as { type?: string; result?: unknown } | null;
        if (frame && frame.type === 'suite-complete') {
            console.log('\n=== Vanilla JS Benchmark Results ===');
            console.table(frame.result);
            console.log('========================\n');
        }
    },
};

const bundlePath = resolve(__dirname, '../todomvc/examples/javascript-es6/dist/app.bundle.js');
const bundleCode = readFileSync(bundlePath, 'utf-8');

console.log('Loading Vanilla JS bundle...');
const scriptEl = window.document.createElement('script');
scriptEl.textContent = bundleCode;
window.document.body.appendChild(scriptEl);

setTimeout(() => {
    console.log('Starting Speedometer 3 benchmark simulation...');
    window.postMessage(
        {
            id: 'todomvc-vanilla',
            key: 'benchmark-connector',
            type: 'benchmark-suite',
            name: 'Speedometer 3',
        },
        '*'
    );

    setTimeout(() => {
        console.log('Benchmark complete. Exiting.');
        process.exit(0);
    }, 3000);
}, 1000);
