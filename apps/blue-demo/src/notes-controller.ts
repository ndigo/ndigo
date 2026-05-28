/**
 * Controller for the Notes feature routes.
 *
 * @author Jeff Rose
 */

import { routeMapping, ModelAndView } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { ApplicationContext, AsApplicationContextAware } from '@blue/context';
import { Null } from '@blue/core';
import { traced, getLogger } from '@blue/telemetry';
import { WicketView } from '@blue/view-wicket';
import { BrowserDOMProvider } from '@blue/dom';
import NotesPage from './notes-page';
import { NOTES_SERVICE } from './context-tokens';

const logger = getLogger('blue-demo:notes-controller');

/**
 * Routes Notes requests to Wicket views.
 */
@routeMapping('/')
class NotesController extends AsApplicationContextAware(Null) {
    readonly applicationContext!: ApplicationContext;

    /**
     * Handles the feature root route and renders the notes page.
     *
     * @param route - The matched route.
     * @returns The model and Wicket view for notes.
     */
    @routeMapping('/')
    @traced
    handleIndex(route: Route): ModelAndView {
        logger.info('Handling route', { 'route.path': route.path });
        const notesService = this.applicationContext.getValue(NOTES_SERVICE);
        const lang = 'en'; // default language — could later come from a session/route param

        const model = {
            items: [...notesService.items],
            todoRoute: '#/todo/',
            labels: {
                title: this.applicationContext.getContent('notes.page.title', lang),
                add: this.applicationContext.getContent('notes.btn.add', lang),
                remove: this.applicationContext.getContent('notes.btn.remove', lang),
                empty: this.applicationContext.getContent('notes.empty', lang),
            },
        };
        return new ModelAndView(new WicketView(NotesPage, new BrowserDOMProvider()), model);
    }
}

export default NotesController;
