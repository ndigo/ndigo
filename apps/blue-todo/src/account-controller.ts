/**
 * @module blue-todo
 * @since 1.0.0
 * @author Jeff Rose
 */
import { routeMapping, parameters, pathValue, ModelAndView } from '@blue/dispatcher';
import { traced, getLogger } from '@blue/telemetry';

const logger = getLogger('blue-todo:account-controller');

@routeMapping('/account')
class AccountController {
    @routeMapping('/')
    @parameters({ path: pathValue() })
    @traced
    handleIndex(path: string) {
        logger.info('Handling route', { path: path });

        return new ModelAndView('account-app', {
            section: 'overview',
            title: 'Account Overview',
        });
    }

    @routeMapping('/settings')
    @parameters({ path: pathValue() })
    @traced
    handleSettings(path: string) {
        logger.info('Handling route', { path: path });

        return new ModelAndView('account-app', {
            section: 'settings',
            title: 'Account Settings',
        });
    }
}

export default AccountController;
