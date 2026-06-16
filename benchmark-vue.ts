import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const dom = new JSDOM('<!DOCTYPE html><html><body><section class="todoapp"></section></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true,
  resources: 'usable',
  runScripts: 'dangerously'
});

(global as any).window = dom.window;
(global as any).document = dom.window.document;
(global as any).HTMLElement = dom.window.HTMLElement;
(global as any).Element = dom.window.Element;
(global as any).Node = dom.window.Node;
(global as any).localStorage = dom.window.localStorage;
(global as any).Event = dom.window.Event;
(global as any).KeyboardEvent = dom.window.KeyboardEvent;

const window = dom.window;

if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (cb: FrameRequestCallback) => setTimeout(cb, 16) as any;
}
(globalThis as any).requestAnimationFrame = window.requestAnimationFrame.bind(window);

if (!window.performance?.now) {
  (window as any).performance = { now: () => Date.now() };
}

if (!(globalThis as any).crypto?.randomUUID) {
  (globalThis as any).crypto = {
    randomUUID: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: string) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    })
  };
}

(window as any).parent = {
  postMessage: (message: any, _targetOrigin: string) => {
    if (message && message.type === 'suite-complete') {
      console.log('\n=== Vue Benchmark Results ===');
      console.table(message.result);
      console.log('========================\n');
    }
  }
};

const bundlePath = resolve(__dirname, '../todomvc/examples/vue/dist/assets/index-BPaT6s9q.js');
const bundleCode = readFileSync(bundlePath, 'utf-8');

console.log('Loading Vue bundle...');
const scriptEl = window.document.createElement('script');
scriptEl.textContent = bundleCode;
window.document.body.appendChild(scriptEl);

setTimeout(() => {
  console.log('Starting Speedometer 3 benchmark simulation...');
  window.postMessage({ 
    id: "todomvc-vue",
    key: "benchmark-connector", 
    type: "benchmark-suite",
    name: "Speedometer 3"
  }, '*');
  
  setTimeout(() => {
    console.log('Benchmark complete. Exiting.');
    process.exit(0);
  }, 3000);
}, 1000);