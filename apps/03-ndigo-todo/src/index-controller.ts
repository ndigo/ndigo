/**
 * @module ndigo-todo
 * @since 1.0.0
 * @author Jeff Rose
 */
import { routeMapping, parameters, pathValue, ModelAndView } from '@ndigo/dispatcher';
import { ApplicationContext, AsApplicationContextAware } from '@ndigo/context';
import { Null } from '@ndigo/core';
import { traced } from '@ndigo/telemetry';
import { getLogger } from '@ndigo/log';
import { TODO_SERVICE } from './context-tokens';

const logger = getLogger('ndigo-todo:index-controller');

@routeMapping('/')
class IndexController extends AsApplicationContextAware(Null) {
    readonly applicationContext!: ApplicationContext;

    /**
     * Builds the todo view model. Items are always included: the list is the
     * view's source of truth for client-side filtering, so a deep link or
     * reload on `/`, `/active`, `/completed` (or `/index`) must seed it —
     * omitting items on filter routes left a fresh page with an empty list.
     */
    _createModel(filter: 'all' | 'active' | 'completed') {
        const todoService = this.applicationContext.getValue(TODO_SERVICE);
        return {
            filter,
            items: todoService.items,
        };
    }

    @routeMapping('/index')
    @parameters({ path: pathValue() })
    @traced
    handleIndex(path: string) {
        logger.info('Handling route', { path: path });
        const model = this._createModel('all');
        return new ModelAndView('todo-app', model);
    }

    @routeMapping('/')
    @parameters({ path: pathValue() })
    @traced
    handleAll(path: string) {
        logger.info('Handling route', { path: path });
        const model = this._createModel('all');
        return new ModelAndView('todo-app', model);
    }

    @routeMapping('/active')
    @parameters({ path: pathValue() })
    @traced
    handleActive(path: string) {
        logger.info('Handling route', { path: path });
        const model = this._createModel('active');
        return new ModelAndView('todo-app', model);
    }

    @routeMapping('/completed')
    @parameters({ path: pathValue() })
    @traced
    handleCompleted(path: string) {
        logger.info('Handling route', { path: path });
        const model = this._createModel('completed');
        return new ModelAndView('todo-app', model);
    }
}

export default IndexController;
