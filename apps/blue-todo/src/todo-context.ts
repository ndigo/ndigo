import { configuration, entry } from '@blue/context';
import { ApplicationBuilder } from '@blue/boot';
import { WebAutoConfiguration } from '@blue/platform-web';
import { LoggingRouteHandlerInterceptor, LinearMetadataHandlerMapping } from '@blue/dispatcher';
import { getLogger } from '@blue/telemetry';
import { NameViewResolver } from '@blue/view';
import { DOMElementViewTarget, WebComponentViewEngine } from '@blue/view-webcomponent';
import AccountController from './account-controller';
import IndexController from './index-controller';
import AccountApp from './account-app-view';
import MyTodoApp from './todo-app-view';
import TodoService from './todo-service';
import { StaticContentSource } from '@blue/content';

@configuration
class ToDoconfiguration {
    @entry
    accountApp() {
        return new AccountApp();
    }

    @entry
    accountController() {
        return new AccountController();
    }

    @entry
    todoApp() {
        return new MyTodoApp();
    }

    @entry
    indexController() {
        return new IndexController();
    }

    @entry
    handlerMapping() {
        // TODO Fix the default handler mappings
        const mapping = new LinearMetadataHandlerMapping();
        mapping.interceptors.push(new LoggingRouteHandlerInterceptor(getLogger('blue-todo:dispatcher')));
        return mapping;
    }

    @entry
    viewResolver() {
        return new NameViewResolver();
    }

    @entry
    viewTarget() {
        const target = new DOMElementViewTarget(document.getElementById('app'));
        target.setEventMap({
            onSubmit: 'user:todo:created',
            onRemove: 'user:todo:removed',
            onToggle: 'user:todo:toggled',
        });
        return target;
    }

    @entry
    webComponentViewEngine() {
        return new WebComponentViewEngine();
    }

    @entry
    todoService() {
        return new TodoService([
            { text: 'Build a micro frontend', checked: false },
            { text: 'Learn about Web Components', checked: true },
        ]);
    }
}

export const createTodoContext = () => {
    // The browser auto-config (argument resolvers etc.) is registered
    // explicitly — @blue/boot no longer auto-registers it.
    const context = new ApplicationBuilder([WebAutoConfiguration, ToDoconfiguration]).run();
    return context;
};