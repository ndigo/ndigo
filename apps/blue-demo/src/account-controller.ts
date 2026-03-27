import { routeMapping, ModelAndView } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { WebComponentView } from '@blue/view-webcomponent';

@routeMapping('/account')
class AccountController {
    @routeMapping('')
    handleIndex(route: Route) {
        console.log('AccountController::Handling Route', route);

        return new ModelAndView(new WebComponentView('account-app'), {
            section: 'overview',
            title: 'Account Overview',
        });
    }

    @routeMapping('/settings')
    handleSettings(route: Route) {
        console.log('AccountController::Handling Route', route);

        return new ModelAndView(new WebComponentView('account-app'), {
            section: 'settings',
            title: 'Account Settings',
        });
    }
}

export default AccountController;
