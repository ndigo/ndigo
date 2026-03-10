import { vi, expect } from 'vitest';
import { ModelAndView } from '../src/model-and-view';

export const errorModel = new ModelAndView('error');

export const testModel = new ModelAndView('test');

export const handleRouteSpy = vi.fn().mockReturnValue(testModel);

export const renderSpy = vi.fn();

export const resolveLanguageSpy = vi.fn().mockReturnValue('en-US');

export const completeHandleSpy = vi.fn();

export class TestController {
    id?: number;
    handleRoute = handleRouteSpy;
}

export class TestControllerHandlerAdapter {
    handle(route: any, handler: any) {
        expect(handler).toBeInstanceOf(TestController);
        return handler.handleRoute(route);
    }
    supports(handler: any) {
        const isSupported = handler instanceof TestController;
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
        completeHandleSpy(route, handler, error);
    }

    postHandle(route: any, handler: any, modelAndView: any) {}

    preHandle(route: any, handler: any) {
        return true;
    }
}

export class TestLanguageResolver {
    resolveLanguage = resolveLanguageSpy;
}

export class TestThemeResolver {
    resolveTheme(route: any) {
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
        return Promise.resolve(new TestView(name));
    }
}
