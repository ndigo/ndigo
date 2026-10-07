/**
 * The HTML shell: `GET /` renders the EJS page that mounts the `kanban-board`
 * Web Component on the seeded demo board; the built client bundle is served
 * under `/static/` by the platform `StaticController`.
 *
 * @module blue-kanban
 * @since 1.0.0
 * @author Jeff Rose
 */
import { getMapping, ModelAndView, requestMapping } from '@blue/dispatcher';
import { DEMO_BOARD } from './board-service';

/**
 * Serves the board shell.
 */
@requestMapping('/')
export class ShellController {
    /**
     * Renders the shell document. The board the component subscribes to rides
     * a `data-*` attribute on the inert `<kanban-board>` element; the client
     * reads it on connect, so the page works with no server round trip for
     * configuration beyond the document itself.
     *
     * @returns The shell view.
     */
    @getMapping('/')
    index() {
        return new ModelAndView('shell', {
            appTitle: 'Blue Kanban',
            boardId: DEMO_BOARD.id,
            boardTitle: DEMO_BOARD.title,
        });
    }
}
