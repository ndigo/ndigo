import { vi, expect } from 'vitest';
import { ModelAndView } from '../src/model-and-view';

export const errorModel = new ModelAndView('error');

export const testModel = new ModelAndView('test');

export const handleRouteSpy = vi.fn().mockReturnValue(testModel);

export const renderSpy = vi.fn();

export const resolveLanguageSpy = vi.fn().mockReturnValue('en-US');

export class TestController {
    id?: number;
    handleRoute = handleRouteSpy;
}

export class TestControllerHandlerAdapter {
    handle(route: any, handler: any) {
        console.log('TestControllerHandlerAdapter::Handle', route, handler);
        expect(handler).toBeInstanceOf(TestController);
        return handler.handleRoute(route);
    }
    supports(handler: any) {
        const isSupported = handler instanceof TestController;
        console.log('TestControllerHandlerAdapter::Supports', isSupported, handler);
        expect(isSupported).toBe(true);
        return isSupported;
    }
}

export class TestErrorResolver {
    resolveError(route: any, handler: any, error: any) {
        return errorModel;
    }
}

export class TestHandlerInterceptor {
    completeHandle(route: any, handler: any, error: any) {
        console.log('TestHandlerInterceptor::completeHandle', route, handler, error);
    }

    postHandle(route: any, handler: any, modelAndView: any) {
        console.log('TestHandlerInterceptor::postHandle', route, handler, modelAndView);
    }

    preHandle(route: any, handler: any) {
        console.log('TestHandlerInterceptor::preHandle', route, handler);
        return true;
    }
}

export class TestLanguageResolver {
    resolveLanguage = resolveLanguageSpy;
}

export class TestThemeResolver {
    resolveTheme(route: any) {
        console.log('TestThemeResolver::resolveTheme', route);
        return 'testTheme';
    }
}

export class TestView {
    name: string;
    render = renderSpy;

    constructor(name: string) {
        this.name = name;
    }
}

export class TestViewResolver {
    resolveViewName(name: string, language: string) {
        console.log('TestViewResolver::resolveViewName', name, language);
        return Promise.resolve(new TestView(name));
    }
}
