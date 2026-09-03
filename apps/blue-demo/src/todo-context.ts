import { configuration, entry } from '@blue/context';
import { ApplicationBuilder } from '@blue/boot';
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
import { LoginView } from './login-view';
import { ProfileView } from './profile-view';
import { AdminView } from './admin-view';
import { ForbiddenView } from './forbidden-view';

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
        mapping.interceptors.push(new LoggingRouteHandlerInterceptor(getLogger('blue-demo:dispatcher')));
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
            { text: 'my initial todo', checked: false },
            { text: 'Learn about Web Components', checked: true },
        ]);
    }

    // ── Auth views ────────────────────────────────────────────────────────────
    @entry
    loginView() {
        return new LoginView();
    }

    @entry
    profileView() {
        return new ProfileView();
    }

    @entry
    adminView() {
        return new AdminView();
    }

    @entry
    forbiddenView() {
        return new ForbiddenView();
    }
}

export const createTodoContext = () => {
    const context = new ApplicationBuilder([ToDoconfiguration]).run();
    return context;
};