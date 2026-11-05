/**
 * Boot-and-probe smoke gate for the Node example applications.
 *
 * For every registered app: spawn its `start` script on a dedicated probe port,
 * poll the probe route until it answers, assert the expected status/body,
 * optionally round-trip a WebSocket frame, then SIGTERM the process and require
 * a graceful exit — code 0, death by the signal, or a wrapper's 128 + SIGTERM.
 * This covers the real-process surface that in-process tests miss:
 * socket bind, static files, view rendering, and graceful shutdown.
 *
 * Probe ports live in the dedicated 4xxx range, never the documented dev port,
 * so a running dev server can never masquerade as a passing smoke.
 *
 * Registry: add one entry per new Node app (browser apps are covered by their
 * own `pnpm test`, which builds the bundle and runs the bundle spec). Keep
 * probe ports unique.
 *
 * Run: `pnpm apps:smoke` (or `node scripts/apps-smoke.mjs --only api`).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const READY_TIMEOUT_MS = Number(process.env['APPS_SMOKE_READY_MS'] ?? 60_000);
const EXIT_TIMEOUT_MS = 10_000;
const WS_TIMEOUT_MS = 10_000;
/** Exit code a runtime wrapper reports for "terminated by SIGTERM" (128 + 15). */
const SIGTERM_EXIT_CODE = 128 + 15;
const LOG_TAIL = 8_000;

/**
 * One entry per Node example app.
 *
 * @typedef {{
 *     dir: string,
 *     port: number,
 *     probe: string,
 *     expectStatus?: number,
 *     expectBody?: string,
 *     websocket?: string,
 *     env?: Record<string, string>,
 * }} AppProbe
 */

/** @type {AppProbe[]} */
const APPS = [
    {
        dir: '02-ndigo-hello-node',
        port: 4010,
        probe: '/hello?name=smoke',
        expectBody: 'Hello, smoke!',
        websocket: '/echo',
    },
    { dir: '04-ndigo-api', port: 4000, probe: '/health', expectStatus: 200 },
    { dir: '06-ndigo-island', port: 4200, probe: '/', expectBody: '<todo-app' },
    { dir: '08-ndigo-httpbin', port: 4020, probe: '/get' },
    { dir: '09-ndigo-todobackend', port: 4030, probe: '/todos' },
    { dir: '10-ndigo-conduit-api', port: 4040, probe: '/api/tags' },
    { dir: '12-ndigo-petclinic', port: 4050, probe: '/', expectBody: 'Welcome to Ndigo PetClinic' },
    { dir: '13-ndigo-chat', port: 4060, probe: '/health' },
    { dir: '14-ndigo-kanban', port: 4070, probe: '/health' },
    { dir: '15-ndigo-resilience-lab', port: 4080, probe: '/health' },
    { dir: '16-ndigo-redis-fanout', port: 4160, probe: '/health' },
    { dir: '17-ndigo-telemetry-lab', port: 4090, probe: '/health' },
    { dir: '18-ndigo-auth-playground', port: 4110, probe: '/health', env: { OIDC_ISSUER_PORT: '4111' } },
];

/**
 * @param {AppProbe} app
 */
async function runApp(app) {
    const cwd = join(ROOT, 'apps', app.dir);
    const url = `http://127.0.0.1:${app.port}${app.probe}`;

    /**
     * Whether the probe URL answers right now.
     *
     * @param {number} timeoutMs
     */
    const portAnswers = async (timeoutMs = 1_000) => {
        try {
            await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
            return true;
        } catch {
            return false;
        }
    };

    // A stale listener on the probe port would make every later assertion
    // vacuous — refuse to run rather than report a false pass.
    if (await portAnswers(500)) {
        throw new Error(`probe port ${app.port} is already answering before start (stale listener?)`);
    }
    // Run the app's own `scripts.start` directly (what `pnpm start` executes)
    // instead of spawning `pnpm`, whose CLI may only exist as a PATH-dependent
    // shim. node's own bin dir + the app's node_modules/.bin are prepended so
    // `tsx`/`vite` shebangs resolve everywhere (CI and fnm-style local setups).
    const manifest = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
    const startScript = manifest.scripts?.start ?? manifest.scripts?.dev;
    if (!startScript) {
        throw new Error('package.json defines neither a start nor a dev script');
    }
    const child = spawn('sh', ['-c', `exec ${startScript}`], {
        cwd,
        env: {
            ...process.env,
            PORT: String(app.port),
            ...app.env,
            PATH: [join(cwd, 'node_modules', '.bin'), dirname(process.execPath), process.env.PATH].join(':'),
        },
        stdio: ['ignore', 'pipe', 'pipe'],
        // Own process group: `tsx` may spawn a child node process, so signals
        // must reach the group or the app survives the smoke (leaked listener).
        detached: true,
    });

    /** @param {NodeJS.Signals} signal */
    const signalGroup = (signal) => {
        if (child.pid === undefined) {
            child.kill(signal);
            return;
        }
        try {
            process.kill(-child.pid, signal);
        } catch {
            child.kill(signal);
        }
    };

    let output = '';
    child.stdout.on('data', (chunk) => (output = (output + chunk).slice(-LOG_TAIL)));
    child.stderr.on('data', (chunk) => (output = (output + chunk).slice(-LOG_TAIL)));
    const exited = new Promise((resolve) => child.once('exit', (code, signal) => resolve({ code, signal })));

    /**
     * Kill the app and fail with the captured process output attached.
     *
     * @param {string} message
     */
    const fail = (message) => {
        signalGroup('SIGKILL');
        throw new Error(`${message}\n--- ${app.dir} output ---\n${output.trim() || '(no output)'}`);
    };

    /** @type {Response | undefined} */
    let response;
    const deadline = Date.now() + READY_TIMEOUT_MS;
    while (Date.now() < deadline) {
        try {
            // eslint-disable-next-line no-await-in-loop -- readiness polling is inherently sequential.
            response = await fetch(url);
            break;
        } catch {
            // Server not accepting connections yet; keep polling.
            // eslint-disable-next-line no-await-in-loop -- readiness polling is inherently sequential.
            await delay(250);
        }
    }
    if (!response) {
        fail(`no response on ${url} after ${READY_TIMEOUT_MS}ms`);
    }

    const expectStatus = app.expectStatus ?? 200;
    if (response.status !== expectStatus) {
        fail(`${url} → ${response.status} (expected ${expectStatus})`);
    }
    if (app.expectBody) {
        const body = await response.text();
        if (!body.includes(app.expectBody)) {
            fail(`${url} body does not contain ${JSON.stringify(app.expectBody)}`);
        }
    }
    if (app.websocket) {
        const echoed = await probeWebSocket(`ws://127.0.0.1:${app.port}${app.websocket}`);
        if (!echoed.includes('smoke-frame')) {
            fail(`${app.websocket} echo did not round-trip the smoke frame`);
        }
    }

    signalGroup('SIGTERM');
    const result = await Promise.race([exited, delay(EXIT_TIMEOUT_MS).then(() => undefined)]);
    if (!result) {
        fail('did not exit within 10s of SIGTERM (graceful shutdown broken?)');
    }
    // tsx sometimes handles the group SIGTERM and exits with 128 + SIGTERM
    // (143) instead of dying by the signal; both mean "terminated on request".
    // The port-release assertion below still enforces real cleanup. (#33)
    if (result.code !== 0 && result.signal !== 'SIGTERM' && result.code !== SIGTERM_EXIT_CODE) {
        fail(`exited with code=${result.code} signal=${result.signal}`);
    }

    // The listener must actually be gone: a surviving grandchild (or an
    // un-killed instance) would poison every later run on this port.
    const releaseDeadline = Date.now() + 2_000;
    // eslint-disable-next-line no-await-in-loop -- the release check is a bounded poll.
    while (Date.now() < releaseDeadline && (await portAnswers(300))) {
        // eslint-disable-next-line no-await-in-loop -- the release check is a bounded poll.
        await delay(100);
    }
    if (await portAnswers(300)) {
        fail(`port ${app.port} still answers after exit (leaked listener)`);
    }
    return output.trim().split('\n').at(-1) ?? '';
}

/**
 * @param {string} url
 */
async function probeWebSocket(url) {
    const socket = new WebSocket(url);
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(
            () => reject(new Error(`WebSocket ${url} timed out after ${WS_TIMEOUT_MS}ms`)),
            WS_TIMEOUT_MS
        );
    });
    try {
        await Promise.race([
            new Promise((resolve, reject) => {
                socket.addEventListener('open', resolve, { once: true });
                socket.addEventListener('error', () => reject(new Error(`WebSocket ${url} failed to open`)), {
                    once: true,
                });
            }),
            timeout,
        ]);
        return await Promise.race([
            new Promise((resolve, reject) => {
                socket.addEventListener('message', (event) => resolve(String(event.data)), { once: true });
                socket.addEventListener('error', () => reject(new Error(`WebSocket ${url} errored`)), { once: true });
                socket.send('{"smoke":"smoke-frame"}');
            }),
            timeout,
        ]);
    } finally {
        clearTimeout(timer);
        socket.close();
    }
}

const onlyIndex = process.argv.indexOf('--only');
const only = onlyIndex >= 0 ? process.argv[onlyIndex + 1] : undefined;
const apps = only ? APPS.filter((app) => app.dir.includes(only)) : APPS;
if (apps.length === 0) {
    console.error(`apps-smoke: nothing matches --only ${only}`);
    process.exit(1);
}

const failures = [];
for (const app of apps) {
    const started = Date.now();
    try {
        // eslint-disable-next-line no-await-in-loop -- apps are probed one at a time so ports and process output stay attributable.
        await runApp(app);
        console.log(`ok   ${app.dir}  (port ${app.port}, ${Date.now() - started}ms)`);
    } catch (error) {
        failures.push(app.dir);
        console.error(`FAIL ${app.dir}: ${error instanceof Error ? error.message : String(error)}`);
    }
}

if (failures.length > 0) {
    console.error(`apps-smoke: ${failures.length}/${apps.length} failed (${failures.join(', ')})`);
    process.exit(1);
}
console.log(`apps-smoke: ${apps.length} app(s) booted, probed, and shut down cleanly`);
process.exit(0);
