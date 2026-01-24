import { ModelAndView } from '../src/model-and-view';
const { fake, spy } = require( 'sinon' );

export const errorModel = new ModelAndView( 'error' );

export const testModel = new ModelAndView( 'test' );

export const handleRouteSpy = fake.returns( testModel );

export const renderSpy = spy();

export const resolveLanguageSpy = fake.returns( 'en-US' );

export class TestController {
    constructor(){
        this.handleRoute = handleRouteSpy;
    }
}

export class TestControllerHandlerAdapter {
    handle( route, handler ){
        console.log( 'TestControllerHandlerAdapter::Handle', route, handler );
        expect( handler ).toBeInstanceOf( TestController );
        return handler.handleRoute( route );
    }
    supports( handler ){
        const isSupported = handler instanceof TestController;
        console.log( 'TestControllerHandlerAdapter::Supports', isSupported, handler );
        expect( isSupported ).toBe( true );
        return isSupported;
    }
}

export class TestErrorResolver {
    resolveError( route, handler, error ){
        return errorModel;
    }
}

export class TestHandlerInterceptor {
    completeHandle( route, handler, error ){
        console.log( 'TestHandlerInterceptor::completeHandle', route, handler, error );
    }

    postHandle( route, handler, modelAndView ){
        console.log( 'TestHandlerInterceptor::postHandle', route, handler, modelAndView );
    }

    preHandle( route, handler ){
        console.log( 'TestHandlerInterceptor::preHandle', route, handler );
        return true;
    }
}

export class TestLanguageResolver {
    constructor(){
        this.resolveLanguage = resolveLanguageSpy;
    }
}

export class TestThemeResolver {
    resolveTheme( route ){
        console.log( 'TestThemeResolver::resolveTheme', route );
        return 'testTheme';
    }
}

export class TestView {
    constructor( name ){
        this.name = name;
        this.render = renderSpy;
    }
}

export class TestViewResolver {
    resolveViewName( name, language ){
        console.log( 'TestViewResolver::resolveViewName', name, language );
        return Promise.resolve( new TestView( name ) );
    }
}
