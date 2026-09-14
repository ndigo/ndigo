/**
 * @module blue-todo
 * @since 1.0.0
 * @author Jeff Rose
 */
import { configuration, entry } from '@blue/context';
import { ApplicationBuilder } from '@blue/boot';
import { WebAutoConfiguration } from '@blue/platform-web';
import { LoggingRouteHandlerInterceptor, RadixMetadataHandlerMapping } from '@blue/dispatcher';
import { getLogger } from '@blue/telemetry';
import { DOMElementViewTarget } from '@blue/view-webcomponent';
import AccountController from './account-controller';
import IndexController from './index-controller';
// Side-effect imports: loading these modules registers the components
// (`@TagMapping` → `customElements.define`).
import './account-app-view';
import './todo-app-view';
import TodoService from './todo-service';

@configuration
class ToDoconfiguration {
    @entry
    accountController() {
        return new AccountController();
    }

    @entry
    indexController() {
        return new IndexController();
    }

    @entry
    handlerMapping() {
        // TODO Fix the default handler mappings
        const mapping = new RadixMetadataHandlerMapping();
        mapping.interceptors.push(new LoggingRouteHandlerInterceptor(getLogger('blue-todo:dispatcher')));
        return mapping;
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
    todoService() {
        return new TodoService([
            { text: 'Build a micro frontend', checked: false },
            { text: 'Learn about Web Components', checked: true },
        ]);
    }
}

export const createTodoContext = async () => {
    // The browser auto-config (view resolver chain, web component engine,
    // argument resolvers) is registered explicitly — @blue/boot no longer
    // auto-registers it.
    return new ApplicationBuilder([WebAutoConfiguration, ToDoconfiguration]).run();
};
