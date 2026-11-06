/**
 */
import {
    ApplicationContextAwareProcessor,
    configuration,
    MetadataConfigApplicationContext,
    entry,
} from '@ndigo/context';
import { TestViewResolver } from '../test-strategies';

import { MetadataErrorResolver } from '../../src/route-error-resolver';
import { routeMapping } from '../../src/route-mapping';
import { ModelAndView } from '../../src/model-and-view';
import { errorMapping, errorHandler } from '../../src/error-mapping';
import { Route } from '@ndigo/router';

@routeMapping('/bad')
class BadController {
    @routeMapping('/bad')
    handleBad(route: Route) {
        throw new Error('Bad');
    }

    @routeMapping('/reference')
    handleReference(route: Route) {
        throw new ReferenceError('Bad Reference');
    }

    @routeMapping('/syntax')
    handleSyntax(route: Route) {
        throw new SyntaxError('Bad Syntax');
    }

    @routeMapping('/range')
    handleRange(route: Route) {
        throw new RangeError('Bad Range');
    }

    @errorMapping(RangeError)
    handleRangeError(route: Route, error: Error, handlerMethod: unknown) {
        return new ModelAndView('error');
    }
}

@errorHandler
class GlobalErrorHandler {
    @errorMapping(Error)
    handleError(route: Route, error: Error, handlerMethod: unknown) {
        return new ModelAndView('error');
    }

    @errorMapping(TypeError)
    handleTypeError(route: Route, error: Error, handlerMethod: unknown) {
        return new ModelAndView('error');
    }

    @errorMapping([ReferenceError, SyntaxError])
    handleOtherErrors(route: Route, error: Error, handlerMethod: unknown) {
        return new ModelAndView('error');
    }
}

@configuration
class TestConfiguration {
    @entry()
    badController() {
        return new BadController();
    }

    @entry()
    errorResolvers() {
        const metadataErrorResolver = new MetadataErrorResolver();
        return [metadataErrorResolver];
    }

    @entry()
    globalErrorResolver() {
        return new GlobalErrorHandler();
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
