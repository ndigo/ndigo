import { routeMapping, ModelAndView } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { ApplicationContext, AsApplicationContextAware } from '@blue/context';
import { Null } from '@blue/core';
import { traced, getLogger } from '@blue/telemetry';
import { TODO_SERVICE } from './context-tokens';

const logger = getLogger('blue-todo:index-controller');

@routeMapping('/')
class IndexController extends AsApplicationContextAware(Null) {
    readonly applicationContext!: ApplicationContext;

    _createModel(filter: 'all' | 'active' | 'completed', includeItems: boolean = true) {
        const todoService = this.applicationContext.getValue(TODO_SERVICE);
        return {
            filter,
            ...(includeItems ? { items: todoService.items } : {}),
        };
    }

    @routeMapping('/index')
    @traced
    handleIndex(route: Route) {
        logger.info('Handling route', { 'route.path': route.path });
        const model = this._createModel('all');
        return new ModelAndView('todo-app', model);
    }

    @routeMapping('/')
    @traced
    handleAll(route: Route) {
        logger.info('Handling route', { 'route.path': route.path });
        const model = this._createModel('all', false);
        return new ModelAndView('todo-app', model);
    }

    @routeMapping('/active')
    @traced
    handleActive(route: Route) {
        logger.info('Handling route', { 'route.path': route.path });
        const model = this._createModel('active', false);
        return new ModelAndView('todo-app', model);
    }

    @routeMapping('/completed')
    @traced
    handleCompleted(route: Route) {
        logger.info('Handling route', { 'route.path': route.path });
        const model = this._createModel('completed', false);
        return new ModelAndView('todo-app', model);
    }
}

export default IndexController;
