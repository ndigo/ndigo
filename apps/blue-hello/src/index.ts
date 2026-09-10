import helloContext from './hello-context';
import './hello-app-view';
import { BrowserDispatcher } from '@blue/platform-web';
import { HashRouter } from '@blue/platform-web';
import type { Route } from '@blue/router';

const dispatcher = new BrowserDispatcher();
dispatcher.initStrategies(helloContext);

const router = new HashRouter((route: Route) => {
    void dispatcher.dispatch(route);
});

// Ensure the root route is dispatched on initial load.
// Setting the hash triggers hashchange; refresh() handles page reloads.
if (location.hash === '#/') {
    router.refresh();
} else {
    location.hash = '/';
}
