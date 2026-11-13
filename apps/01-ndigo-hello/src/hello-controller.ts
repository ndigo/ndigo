/**
 */
import { routeMapping, ModelAndView } from '@ndigo/dispatcher';
import { WebComponentView } from '@ndigo/view-webcomponent';

@routeMapping('/')
class HelloController {
    @routeMapping('/')
    handleRoot() {
        // DECENTRALIZED PLACEMENT: this handler returns a realized view and
        // relies on the registered `viewTarget` from `hello-context.ts`. The
        // dispatcher therefore skips both the resolver chain (no view name)
        // and the targeter chain (no `viewTargeters` configured).
        //
        // The trade-off is locality vs. flexibility: the handler knows its own
        // destination, but every new destination is a code change, and there
        // is no single place that describes the page layout. App 01 keeps this
        // as the counter-example; apps/08-ndigo-views shows the centralized
        // model (handlers return names, one configuration decides placement —
        // see docs/guides/50-view-targeting.md).
        return new ModelAndView(new WebComponentView('hello-app'), { message: 'Hello, World!' });
    }
}

export default HelloController;
