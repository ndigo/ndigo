import {
    ApplicationContextAwareProcessor,
    configuration,
    MetadataConfigApplicationContext,
    entry,
} from '@blue/context';
import { MetadataHandlerMapping } from '@blue/dispatcher';
import { NameViewResolver } from '@blue/view';
import { DOMElementViewTarget, WebComponentViewEngine } from '@blue/view-webcomponent';
import AccountController from './account-controller';
import IndexController from './index-controller';
import AccountApp from './account-app-view';
import MyTodoApp from './todo-app-view';
import TodoService from './todo-service';

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
        return new MetadataHandlerMapping();
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
}

const context = new MetadataConfigApplicationContext('todo'),
    processor = new ApplicationContextAwareProcessor(context);

context.addProcessor(processor);
context.register(ToDoconfiguration);

export default context;
