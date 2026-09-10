import { routeMapping, parameters, pathValue, ModelAndView } from '@blue/dispatcher';
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
        const model = this._createModel('all', false);
        return new ModelAndView('todo-app', model);
    }

    @routeMapping('/active')
    @parameters({ path: pathValue() })
    @traced
    handleActive(path: string) {
        logger.info('Handling route', { path: path });
        const model = this._createModel('active', false);
        return new ModelAndView('todo-app', model);
    }

    @routeMapping('/completed')
    @parameters({ path: pathValue() })
    @traced
    handleCompleted(path: string) {
        logger.info('Handling route', { path: path });
        const model = this._createModel('completed', false);
        return new ModelAndView('todo-app', model);
    }
}

export default IndexController;
