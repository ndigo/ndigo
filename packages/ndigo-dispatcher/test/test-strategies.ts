/**
 */
import { vi, expect } from 'vitest';
import { ModelAndView } from '../src/model-and-view';
import type { MediaType } from '@ndigo/core';

export const errorModel = new ModelAndView('error');

export const testModel = new ModelAndView('test');

export const handleRouteSpy = vi.fn<(route: unknown) => ModelAndView>().mockReturnValue(testModel);

export const renderSpy = vi.fn<(model: unknown, route: unknown, target?: unknown) => unknown>();
export const destroyViewSpy = vi.fn<(name: string) => void>();

export const resolveLanguageSpy = vi.fn<(route: unknown) => string>().mockReturnValue('en-US');

export const completeHandleSpy = vi.fn<(route: unknown, handler: unknown, error: unknown) => void>();

export class TestController {
    id?: number;
    handleRoute = handleRouteSpy;
}

export class TestControllerHandlerAdapter {
    handle(route: unknown, handler: unknown) {
        expect(handler).toBeInstanceOf(TestController);
        return (handler as TestController).handleRoute(route);
    }
    supports(handler: unknown) {
        const isSupported = handler instanceof TestController;
        expect(isSupported).toBe(true);
        return isSupported;
    }
}

export class TestErrorResolver {
    resolveError(route: unknown, handler: unknown, error: unknown) {
        return errorModel;
    }
}

export class TestHandlerInterceptor {
    completeHandle(route: unknown, handler: unknown, error: unknown) {
        completeHandleSpy(route, handler, error);
    }

    postHandle(route: unknown, handler: unknown, modelAndView: unknown) {}

    preHandle(route: unknown, handler: unknown) {
        return true;
    }
}

export class TestLanguageResolver {
    resolveLanguage = resolveLanguageSpy;
}

export class TestThemeResolver {
    resolveTheme(route: unknown) {
        return 'testTheme';
    }
}

export class TestView {
    destroyed = false;
    name: string;
    mediaType: MediaType | null = null;

    render(model: unknown, route: unknown, target?: unknown): void | Promise<void> {
        return renderSpy(model, route, target) as void | Promise<void>;
    }

    destroy() {
        this.destroyed = true;
        destroyViewSpy(this.name);
    }

    constructor(name: string) {
        this.name = name;
    }
}

export class TestViewResolver {
    resolveViewName(name: string, language: string) {
        return Promise.resolve(new TestView(name));
    }
}
