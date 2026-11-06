/**
 * The HTTP surface: `GET /` renders the EJS shell that mounts the `chat-room`
 * Web Component; the built client bundle is served under `/static/` by the
 * platform `StaticController`.
 */
import { getMapping, ModelAndView, requestMapping } from '@ndigo/dispatcher';

/** The rooms offered in the picker (any path-safe name works). */
export const ROOMS = ['lobby', 'random', 'support'] as const;

/**
 * Serves the chat shell.
 */
@requestMapping('/')
export class ChatController {
    /**
     * Renders the shell document. The room list and defaults ride `data-*`
     * attributes on the inert `<chat-room>` element; the client component reads
     * them on connect.
     *
     * @returns The shell view.
     */
    @getMapping('/')
    index() {
        return new ModelAndView('shell', {
            appTitle: 'Ndigo Chat',
            rooms: [...ROOMS],
            defaultRoom: ROOMS[0],
            defaultUser: 'guest',
        });
    }
}
