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

// Set up global objects
(global as any).window = dom.window;
(global as any).document = dom.window.document;
(global as any).HTMLElement = dom.window.HTMLElement;
(global as any).Element = dom.window.Element;
(global as any).Node = dom.window.Node;
(global as any).localStorage = dom.window.localStorage;
(global as any).Event = dom.window.Event;
(global as any).KeyboardEvent = dom.window.KeyboardEvent;
// navigator is read-only in Node, skip it - React bundle should use the window's navigator

const window = dom.window;

// Polyfill requestAnimationFrame
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (callback: FrameRequestCallback) => setTimeout(callback, 16) as any;
}
(globalThis as any).requestAnimationFrame = window.requestAnimationFrame.bind(window);

// Polyfill performance.now
if (!window.performance?.now) {
    (window as any).performance = { now: () => Date.now() };
}

// Polyfill crypto.randomUUID
if (!(globalThis as any).crypto?.randomUUID) {
    (globalThis as any).crypto = {
        randomUUID: () =>
            'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
                const r = (Math.random() * 16) | 0;
                const v = c === 'x' ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            }),
    };
}

// Polyfill parent.postMessage for benchmark results capture
(window as any).parent = {
    postMessage: (message: any, _targetOrigin: string) => {
        if (message && message.type === 'suite-complete') {
            console.log('\n=== React Benchmark Results ===');
            console.table(message.result);
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
