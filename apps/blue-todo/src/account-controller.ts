import { routeMapping, ModelAndView } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { traced, getLogger } from '@blue/telemetry';

const logger = getLogger('blue-todo:account-controller');

@routeMapping('/account')
class AccountController {
    @routeMapping('/')
    @traced
    handleIndex(route: Route) {
        logger.info('Handling route', { 'route.path': route.path });

        return new ModelAndView('account-app', {
            section: 'overview',
            title: 'Account Overview',
        });
    }

    @routeMapping('/settings')
    @traced
    handleSettings(route: Route) {
        logger.info('Handling route', { 'route.path': route.path });

        return new ModelAndView('account-app', {
            section: 'settings',
            title: 'Account Settings',
        });
    }
}

export default AccountController;
