import { routeMapping, ModelAndView } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { WebComponentView } from '@blue/view-webcomponent';

@routeMapping('')
class IndexController {
    @routeMapping('/index')
    handleIndex(route: Route) {
        console.log('IndexController::Handling Route', route);
        const model = {
            items: [
                { text: 'my initial todo', checked: false },
                { text: 'Learn about Web Components', checked: true },
            ],
        };
        return new ModelAndView(new WebComponentView('todo-app'), model);
    }
}

export default IndexController;
