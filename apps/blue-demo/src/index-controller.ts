import { routeMapping, ModelAndView } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { WebComponentView } from '@blue/view-webcomponent';
import { ApplicationContext, AsApplicationContextAware } from '@blue/context';
import { Null } from '@blue/core';
import { TODO_SERVICE } from './context-tokens';

@routeMapping('')
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
    handleIndex(route: Route) {
        console.log('IndexController::Handling Route', route);
        const model = this._createModel('all');
        return new ModelAndView(new WebComponentView('todo-app'), model);
    }

    @routeMapping('')
    handleAll(route: Route) {
        console.log('IndexController::Handling Route', route);
        const model = this._createModel('all', false);
        return new ModelAndView(new WebComponentView('todo-app'), model);
    }

    @routeMapping('/active')
    handleActive(route: Route) {
        console.log('IndexController::Handling Route', route);
        const model = this._createModel('active', false);
        return new ModelAndView(new WebComponentView('todo-app'), model);
    }

    @routeMapping('/completed')
    handleCompleted(route: Route) {
        console.log('IndexController::Handling Route', route);
        const model = this._createModel('completed', false);
        return new ModelAndView(new WebComponentView('todo-app'), model);
    }
}

export default IndexController;
