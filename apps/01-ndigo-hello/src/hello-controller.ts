/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { routeMapping, ModelAndView } from '@ndigo/dispatcher';
import { WebComponentView } from '@ndigo/view-webcomponent';

@routeMapping('/')
class HelloController {
    @routeMapping('/')
    handleRoot() {
        // The simplest example keeps a concrete view by design — constructing
        // a view in the handler is always an option. Most apps instead return
        // a view NAME (`new ModelAndView('hello-app')`) resolved by the
        // resolver chain (WebComponentViewResolver etc.).
        return new ModelAndView(new WebComponentView('hello-app'), { message: 'Hello, World!' });
    }
}

export default HelloController;
