import { routeMapping, ModelAndView } from '@blue/dispatcher';
import { WebComponentView } from '@blue/view-webcomponent';

@routeMapping('/')
class HelloController {
    @routeMapping('/')
    handleRoot() {
        return new ModelAndView(new WebComponentView('hello-app'), { message: 'Hello, World!' });
    }
}

export default HelloController;
