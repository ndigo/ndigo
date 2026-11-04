/**
 * @module ndigo-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { expect } from 'vitest';
import {
    ApplicationContextAwareProcessor,
    configuration,
    MetadataConfigApplicationContext,
    entry,
} from '@ndigo/context';
import { TestErrorResolver, TestViewResolver } from '../test-strategies';

import { routeMapping } from '../../src/route-mapping';
import { ModelAndView } from '../../src/model-and-view';
import { queryValue, matrixValue, pathVariable, parameters } from '../../src/parameters';

@routeMapping('/hello')
class HelloController {
    // /hello/there;name=Jack?name=John
    @routeMapping('/there')
    @parameters({
        n1: queryValue('name'),
        n2: matrixValue('name'),
        id: pathVariable('id'),
    })
    handleThere(n1: string, n2: string, id: string) {
        expect(n1).toBe('John');
        expect(n2).toBe('Jack');
        expect(id).toBe('42');
        return new ModelAndView('test');
    }
}

@configuration
class TestConfiguration {
    @entry()
    errorResolvers() {
        return [new TestErrorResolver()];
    }

    @entry()
    helloController() {
        return new HelloController();
    }

    @entry()
    viewResolver() {
        return new TestViewResolver();
    }
}

const context = new MetadataConfigApplicationContext('test'),
    processor = new ApplicationContextAwareProcessor(context);

context.addProcessor(processor);
context.register(TestConfiguration);

export default context;
