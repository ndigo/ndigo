/**
 * @module blue-todo
 * @since 1.0.0
 * @author Jeff Rose
 */
import { configuration, entry, MetadataConfigApplicationContext } from '@blue/context';
import { WebAutoConfiguration } from '@blue/platform-web';
import { I18nextMessageSource } from '@blue/content-i18next';
import { LoggingRouteHandlerInterceptor, RadixMetadataHandlerMapping } from '@blue/dispatcher';
import { getLogger } from '@blue/log';
import { DOMElementViewTarget } from '@blue/view-webcomponent';
import AccountController from './account-controller';
import AuthController from './auth-controller';
import IndexController from './index-controller';
// Side-effect imports: loading these modules registers the components
// (`@TagMapping` → `customElements.define`).
import './account-app-view';
import './auth-app-view';
import './todo-app-view';
import TodoService from './todo-service';

@configuration
class ToDoconfiguration {
    @entry()
    accountController() {
        return new AccountController();
    }

    @entry()
    authController() {
        return new AuthController();
    }

    @entry()
    indexController() {
        return new IndexController();
    }

    @entry()
    handlerMapping() {
        // Demo default handler mapping: controllers extend it; the logging
        // interceptor surfaces request coverage in dev.
        const mapping = new RadixMetadataHandlerMapping();
        mapping.interceptors.push(new LoggingRouteHandlerInterceptor(getLogger('blue-todo:dispatcher')));
        return mapping;
    }

    @entry()
    viewTarget() {
        const target = new DOMElementViewTarget(document.getElementById('app'));
        target.setEventMap({
            onSubmit: 'user:todo:created',
            onRemove: 'user:todo:removed',
            onToggle: 'user:todo:toggled',
        });
        return target;
    }

    @entry()
    todoService() {
        return new TodoService([
            { text: 'Build a micro frontend', checked: false },
            { text: 'Learn about Web Components', checked: true },
        ]);
    }
}

export const createTodoContext = async () => {
    // Client apps boot `MetadataConfigApplicationContext` — the Node-oriented
    // `ApplicationBuilder` (profiles, CLI args, config files) stays out of the
    // browser path. The browser auto-config (view resolver chain, web component
    // engine, argument resolvers) is registered explicitly; @blue/boot no
    // longer auto-registers it.
    const context = new MetadataConfigApplicationContext('blue-todo');
    context.register(WebAutoConfiguration);
    context.register(ToDoconfiguration);
    context.refresh();

    // The demo message source: the locale switcher renders its label through
    // these keys, and the EJS/template helpers would use the same seam.
    context.setMessageSource(
        new I18nextMessageSource({
            resources: {
                en: { translation: { 'locale.current': 'Language: {{language}}' } },
                fr: { translation: { 'locale.current': 'Langue : {{language}}' } },
            },
            language: 'en',
            fallbackLanguage: 'en',
        })
    );

    return context;
};
