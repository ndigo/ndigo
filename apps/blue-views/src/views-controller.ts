import { parameters, pathVariable, routeMapping, ModelAndView } from '@blue/dispatcher';
import type { ContentSource } from '@blue/content';

/**
 * The demo controller: returns view NAMES exclusively — the resolver
 * composite decides where each view comes from.
 */
@routeMapping('/')
class ViewsController {
    readonly #content: ContentSource;

    constructor(contentSource: ContentSource) {
        this.#content = contentSource;
    }

    /** Component module location → WebComponentViewResolver (eager registry). */
    @routeMapping('/')
    handleShell() {
        return new ModelAndView('shell', { message: 'Blue Views' });
    }

    /** Context-bean location → NameViewResolver (English footer default). */
    @routeMapping('/widget')
    handleWidget() {
        return this.#footerModel('en');
    }

    /**
     * Same bean view, language from the path segment — the i18n demo:
     * `ContentSource.getContent('footer', lang)` resolves the key with
     * fallback to the default language.
     */
    @routeMapping('/widget/:lang')
    @parameters({ lang: pathVariable('lang') })
    handleWidgetLang(lang: string) {
        return this.#footerModel(lang);
    }

    /** Module-on-disk location → ReportViewResolver (path-based import). */
    @routeMapping('/report')
    handleReport() {
        return new ModelAndView('report');
    }

    /** Component-module location → WebComponentViewResolver (client demo). */
    @routeMapping('/client')
    handleClient() {
        return new ModelAndView('clientDemo');
    }

    /** No supported resolver — chain fall-through → NoViewFound. */
    @routeMapping('/nope')
    handleNope() {
        return new ModelAndView('nope');
    }

    #footerModel(language: string): ModelAndView {
        return new ModelAndView('footer', {
            message: this.#content.getContent('footer', language),
            language,
        });
    }
}

export default ViewsController;
