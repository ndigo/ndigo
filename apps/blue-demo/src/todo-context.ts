import {
    ApplicationContextAwareProcessor,
    configuration,
    MetadataConfigApplicationContext,
    entry,
} from '@blue/context';
import { MetadataHandlerMapping } from '@blue/dispatcher';
import { NameViewResolver } from '@blue/view';
import IndexController from './index-controller';
import MyTodoApp from './todo-app-view';

@configuration
class ToDoconfiguration {
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
}

const context = new MetadataConfigApplicationContext('todo'),
    processor = new ApplicationContextAwareProcessor(context);

context.addProcessor(processor);
context.register(ToDoconfiguration);

export default context;
