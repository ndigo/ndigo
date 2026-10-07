/**
 * The playground page: an EJS shell that renders the whole mode catalog
 * server-side and loads the browser client that makes it interactive.
 *
 * The catalog renders without JavaScript on purpose — the page is readable (and
 * every endpoint is discoverable) before the bundle runs; the client then
 * hydrates `#playground` and adds the buttons that actually exercise the modes.
 *
 * @module blue-auth-playground
 * @since 1.0.0
 * @author Jeff Rose
 */
import { getMapping, ModelAndView, requestMapping } from '@blue/dispatcher';
import { MODE_CATALOG } from './mode-catalog';

/** The playground's single page controller. */
@requestMapping('/')
export class PageController {
    /**
     * `GET /` — the shell. The interactive panel is built by
     * `/static/client.js`; everything below is the server's rendering.
     *
     * @returns The `index` view with the mode catalog as its model.
     */
    @getMapping('/')
    index() {
        return new ModelAndView('index', {
            title: 'Blue Auth Playground',
            modes: MODE_CATALOG,
        });
    }
}
