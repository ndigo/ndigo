import { getMapping, ModelAndView } from '@blue/dispatcher';
import { StringTemplateView } from '@blue/view';

// The server-rendered island markup — the Web Component tag with the
// serialized model. `hydrateIslands()` on the client upgrades it to a live
// element with `.model` restored.
const SHELL = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <title>Blue Island — hybrid demo</title>
    <style>
        body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 3rem auto; padding: 0 1rem; }
        todo-app { display: block; border: 1px solid #ddd; border-radius: 8px; padding: 1rem; }
    </style>
</head>
<body>
    <h1>Blue Island</h1>
    <p>Rendered by the <strong>server</strong>; the component below is a
       Web Component island hydrated on the <strong>client</strong>.</p>
    <todo-app data-blue-island data-blue-model="{{islandModel}}"></todo-app>
    <script type="module" src="/static/client.js"></script>
</body>
</html>`;

/** The server-side todo model serialized into the island. */
function todoModel(): unknown {
    return {
        items: [
            { text: 'Server-rendered island', done: true },
            { text: 'Hydrated on the client', done: false },
        ],
        filter: 'all',
    };
}

/**
 * Serves the hybrid shell: a full HTML document containing the server-rendered
 * island (Web Component tag + serialized model) and the client bundle that
 * upgrades it via `hydrateIslands()`.
 */
@getMapping('/')
export class IslandController {
    @getMapping('/')
    index() {
        const serialized = encodeURIComponent(JSON.stringify(todoModel()));
        const view = new StringTemplateView();
        view.template = SHELL.replace('{{islandModel}}', serialized);
        return new ModelAndView(view, { islandModel: serialized });
    }
}