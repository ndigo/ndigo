/**
 * Speedometer-3-style benchmark harness for the todomvc example bundles.
 *
 * One shared jsdom bootstrap — four framework targets selected with
 * `--impl react|svelte|vue|vanilla`. Each target loads its prebuilt bundle
 * (paths relative to the repo root, bundles live in the sibling `todomvc`
 * checkout), kicks the benchmark suite via `postMessage` to the
 * `benchmark-connector` key, prints the reported results and exits.
 *
 * Replaces the former four near-identical `benchmark-{react,svelte,vue,vanilla}.ts`
 * root scripts (2026-10-04 review, H-1).
 *
 * Usage:
 *   pnpm exec tsx scripts/benchmark-dom.ts --impl react
 */
import { JSDOM } from 'jsdom';
import { existsSync, globSync, readFileSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface BenchmarkTarget {
    /** Bundle directory relative to the repo root (the sibling todomvc checkout). */
    bundleDir: string;
    /** Bundle file name — a glob (`index-*.js`) for content-hashed Vite entries. */
    bundle: string;
    /** Page shell the bundle expects on load. */
    html: string;
    /** Results banner label. */
    label: string;
    /** postMessage id the bundle reports under. */
    postId: string;
}

const TARGETS: Record<string, BenchmarkTarget> = {
    react: {
        bundleDir: '../todomvc/examples/react/dist',
        bundle: 'app.bundle.js',
        html: '<!DOCTYPE html><html><body><div id="root"></div></body></html>',
        label: 'React',
        postId: 'todomvc-react',
    },
    svelte: {
        bundleDir: '../todomvc/examples/svelte/dist/assets',
        bundle: 'index-*.js',
        html: '<!DOCTYPE html><html><body><section class="todoapp"></section></body></html>',
        label: 'Svelte',
        postId: 'todomvc-svelte',
    },
    vue: {
        bundleDir: '../todomvc/examples/vue/dist/assets',
        bundle: 'index-*.js',
        html: '<!DOCTYPE html><html><body><section class="todoapp"></section></body></html>',
        label: 'Vue',
        postId: 'todomvc-vue',
    },
    vanilla: {
        bundleDir: '../todomvc/examples/javascript-es6/dist',
        bundle: 'app.bundle.js',
        html: '<!DOCTYPE html><html><body><section class="todoapp"><header class="header"><h1>todos</h1><input class="new-todo" placeholder="What needs to be done?" autofocus/></header><main class="main"><div class="toggle-all-container"><input class="toggle-all" type="checkbox"/> <label class="toggle-all-label" for="toggle-all">Mark all as complete</label></div><ul class="todo-list"></ul></main><footer class="footer"><span class="todo-count"></span><ul class="filters"><li><a href="#/" class="selected">All</a></li><li><a href="#/active">Active</a></li><li><a href="#/completed">Completed</a></li></ul><button class="clear-completed">Clear completed</button></footer></section></body></html>',
        label: 'Vanilla JS',
        postId: 'todomvc-vanilla',
    },
    ndigo: {
        bundleDir: '../todomvc/examples/bluejs/dist/assets',
        bundle: 'index-*.js',
        html: '<!DOCTYPE html><html><body><div id="app"></div></body></html>',
        label: 'Ndigo (BlueJS TodoMVC example)',
        postId: 'todomvc-bluejs-1.0.0',
    },
};

/**
 * Resolves a target's built bundle to an absolute path.
 *
 * Vite content-hashes the Svelte/Vue entry names, so those targets match by
 * glob and the most recently written match wins — a hardcoded hash silently
 * loads a stale bundle after the next sibling build. Missing bundles fail
 * with the build hint instead of a bare ENOENT.
 */
function resolveBundle(target: BenchmarkTarget): string {
    const dir = resolve(__dirname, '..', target.bundleDir);
    const candidates = target.bundle.includes('*')
        ? globSync(target.bundle, { cwd: dir }).map((file) => resolve(dir, file))
        : [resolve(dir, target.bundle)];
    const built = candidates.filter((file) => existsSync(file));
    if (built.length === 0) {
        throw new Error(`no built bundle at ${target.bundleDir}/${target.bundle} — run \`pnpm build:all\` first`);
    }
    return built.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs || (a < b ? 1 : -1))[0];
}

const implFlag = process.argv.indexOf('--impl');
const impl = implFlag !== -1 ? process.argv[implFlag + 1] : undefined;
const target = impl !== undefined ? TARGETS[impl] : undefined;
if (target === undefined) {
    console.error(`usage: tsx benchmark-dom.ts --impl <${Object.keys(TARGETS).join('|')}>`);
    process.exit(2);
}

const dom = new JSDOM(target.html, {
    url: 'http://localhost',
    pretendToBeVisual: true,
    resources: 'usable',
    runScripts: 'dangerously',
});

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

/** Whether the bundle posted a `suite-complete` frame (TOL-F11). */
let resultsReceived = false;

windowSlots.parent = {
    postMessage: (message: unknown, _targetOrigin: string) => {
        const frame = message as { type?: string; result?: unknown } | null;
        if (frame && frame.type === 'suite-complete') {
            resultsReceived = true;
            console.log(`\n=== ${target.label} Benchmark Results ===`);
            console.table(frame.result);
            console.log('========================\n');
        }
    },
};

const bundlePath = resolveBundle(target);
const bundleCode = readFileSync(bundlePath, 'utf-8');

console.log(`Loading ${target.label} bundle (${bundlePath})...`);
const scriptEl = window.document.createElement('script');
scriptEl.textContent = bundleCode;
window.document.body.appendChild(scriptEl);

setTimeout(() => {
    console.log('Starting Speedometer 3 benchmark simulation...');
    window.postMessage(
        {
            id: target.postId,
            key: 'benchmark-connector',
            type: 'benchmark-suite',
            name: 'Speedometer 3',
        },
        '*'
    );

    setTimeout(() => {
        if (!resultsReceived) {
            // A missing `suite-complete` frame means the bundle never reported
            // results (wrong target, broken harness, early failure): exiting 0
            // would silently green a benchmark that measured nothing (TOL-F11).
            console.error('No benchmark results were produced within the timeout — exiting non-zero.');
            process.exit(1);
        }
        console.log('Benchmark complete. Exiting.');
        process.exit(0);
    }, 3000);
}, 1000);
