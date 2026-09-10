import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create a virtual DOM environment with the #root element React expects
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
    url: 'http://localhost',
    pretendToBeVisual: true,
    resources: 'usable',
    runScripts: 'dangerously',
});

/** Node's types don't declare the jsdom surface on globalThis — install it typed. */
const jsdomGlobals: Record<string, unknown> = globalThis as unknown as Record<string, unknown>;
// Set up global objects
jsdomGlobals.window = dom.window;
jsdomGlobals.document = dom.window.document;
jsdomGlobals.HTMLElement = dom.window.HTMLElement;
jsdomGlobals.Element = dom.window.Element;
jsdomGlobals.Node = dom.window.Node;
jsdomGlobals.localStorage = dom.window.localStorage;
jsdomGlobals.Event = dom.window.Event;
jsdomGlobals.KeyboardEvent = dom.window.KeyboardEvent;
// navigator is read-only in Node, skip it - React bundle should use the window's navigator

const window = dom.window;
/** Window slots the DOM types mark readonly — polyfilled here. */
const windowSlots: Record<string, unknown> = window as unknown as Record<string, unknown>;

// Polyfill requestAnimationFrame
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (callback: FrameRequestCallback) => setTimeout(callback, 16) as unknown as number;
}
jsdomGlobals.requestAnimationFrame = window.requestAnimationFrame.bind(window);

// Polyfill performance.now
if (!window.performance?.now) {
    windowSlots.performance = { now: () => Date.now() };
}

// Polyfill crypto.randomUUID
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

// Polyfill parent.postMessage for benchmark results capture
windowSlots.parent = {
    postMessage: (message: unknown, _targetOrigin: string) => {
        const frame = message as { type?: string; result?: unknown } | null;
        if (frame && frame.type === 'suite-complete') {
            console.log('\n=== React Benchmark Results ===');
            console.table(frame.result);
            console.log('========================\n');
        }
    },
};

// Load the built React bundle
const bundlePath = resolve(__dirname, '../todomvc/examples/react/dist/app.bundle.js');
const bundleCode = readFileSync(bundlePath, 'utf-8');

console.log('Loading React bundle...');
const scriptEl = window.document.createElement('script');
scriptEl.textContent = bundleCode;
window.document.body.appendChild(scriptEl);

// Give React time to render
setTimeout(() => {
    console.log('Starting Speedometer 3 benchmark simulation...');
    window.postMessage(
        {
            id: 'todomvc-react',
            key: 'benchmark-connector',
            type: 'benchmark-suite',
            name: 'Speedometer 3',
        },
        '*'
    );

    // Wait for results then exit
    setTimeout(() => {
        console.log('Benchmark complete. Exiting.');
        process.exit(0);
    }, 3000);
}, 1000);
