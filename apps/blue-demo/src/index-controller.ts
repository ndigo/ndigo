import { routeMapping, ModelAndView } from '@blue/dispatcher';
import { Route } from '@blue/router';

@routeMapping('')
class IndexController {
    @routeMapping('/index')
    handleIndex(route: Route) {
        console.log('IndexController::Handling Route', route);
        return new ModelAndView('todoApp', {});
    }
}

export default IndexController;
