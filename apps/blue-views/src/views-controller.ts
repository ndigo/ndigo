import { routeMapping, ModelAndView } from '@blue/dispatcher';

/**
 * The demo controller: returns view NAMES exclusively — the resolver
 * composite decides where each view comes from.
 */
@routeMapping('/')
class ViewsController {
    /** Component module location → WebComponentViewResolver (eager registry). */
    @routeMapping('/')
    handleShell() {
        return new ModelAndView('shell', { message: 'Blue Views' });
    }

    /** Context-bean location → NameViewResolver. */
    @routeMapping('/widget')
    handleWidget() {
        return new ModelAndView('footer');
    }

    /** Module-on-disk location → ReportViewResolver (path-based import). */
    @routeMapping('/report')
    handleReport() {
        return new ModelAndView('report');
    }

    /** No supported resolver — the chain falls through and dispatch 404s. */
    @routeMapping('/nope')
    handleNope() {
        return new ModelAndView('nope');
    }
}

export default ViewsController;
