/**
 * The lab's single page — served by `GET /` as `text/html` (the `ResponseEntity`
 * idiom, no view engine in the way).
 *
 * It is deliberately static: every dynamic value (the server's resolved
 * telemetry config, spans, socket pushes) is rendered by the built client
 * bundle at `/static/client.js`, so the page exercises the real browser-side
 * instrumentation instead of a server-side snapshot. No inline script — the
 * framework's default CSP (`script-src 'self'`) stays intact.
 *
 * @module blue-telemetry-lab
 * @since 1.0.0
 * @author Jeff Rose
 */
export const LAB_PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Blue Telemetry Lab</title>
    <style>
        :root { color-scheme: dark; --line: #2c3242; --dim: #8b93a7; --accent: #67e8a0; }
        * { box-sizing: border-box; }
        body { margin: 0; padding: 1.75rem; background: #0d1117; color: #e6edf3;
               font: 15px/1.5 ui-sans-serif, system-ui, sans-serif; }
        h1 { margin: 0 0 0.25rem; font-size: 1.5rem; }
        h2 { margin: 0 0 0.5rem; font-size: 0.85rem; text-transform: uppercase;
             letter-spacing: 0.08em; color: var(--dim); }
        p { margin: 0 0 0.75rem; max-width: 62rem; }
        code, pre, .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.82rem; }
        .dim { color: var(--dim); }
        .config { border-left: 3px solid var(--accent); padding: 0.5rem 0.75rem; background: #111827; }
        .actions { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; margin: 1.25rem 0; }
        button { font: inherit; padding: 0.45rem 0.9rem; border-radius: 6px; cursor: pointer;
                 border: 1px solid var(--line); background: #1b2130; color: inherit; }
        button:hover { border-color: var(--accent); }
        #socket-status { margin-left: auto; color: var(--dim); }
        .grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(21rem, 1fr)); }
        section { border: 1px solid var(--line); border-radius: 10px; padding: 0.9rem 1rem; background: #111826; }
        ol { list-style: none; margin: 0; padding: 0; max-height: 17rem; overflow-y: auto;
             display: flex; flex-direction: column-reverse; }
        li { padding: 0.3rem 0; border-bottom: 1px solid #1c2230; word-break: break-word; }
        li:first-child { border-bottom: none; }
        .ok { color: var(--accent); }
        .warn { color: #f0b429; }
        .err { color: #ff7b72; }
    </style>
</head>
<body>
    <header>
        <h1>Blue Telemetry Lab</h1>
        <p class="dim">
            A browser action opens a client span, propagates it as W3C <code>traceparent</code>, the server continues
            the trace and instruments the handler; a scheduled task emits its own spans and counters; a socket pushes
            the metric snapshot back to this page. Everything here is exported to the console — or to an OTLP
            collector when <code>OTEL_EXPORTER_OTLP_ENDPOINT</code> is set.
        </p>
        <p class="config mono" id="lab-config">resolving server telemetry config…</p>
    </header>

    <div class="actions">
        <button id="work-get" type="button">GET /work</button>
        <button id="work-post" type="button">POST /work</button>
        <button id="work-burst" type="button">Burst ×5</button>
        <button id="socket-ping" type="button">Send socket ping</button>
        <span id="socket-status" class="mono">socket: connecting…</span>
    </div>

    <main class="grid">
        <section>
            <h2>Browser spans</h2>
            <ol id="browser-spans"></ol>
        </section>
        <section>
            <h2>Server replies — trace continuation</h2>
            <ol id="server-replies"></ol>
        </section>
        <section>
            <h2>Socket pushes</h2>
            <ol id="socket-pushes"></ol>
        </section>
        <section>
            <h2>Console</h2>
            <ol id="lab-log"></ol>
        </section>
    </main>

    <script type="module" src="/static/client.js"></script>
</body>
</html>
`;
