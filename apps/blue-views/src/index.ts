import { MetadataConfigApplicationContext } from '@blue/context';
import { WebAutoConfiguration } from '@blue/platform-web';
import { BrowserDispatcher, HashRouter } from '@blue/platform-web';
import { DOMElementViewTarget } from '@blue/view-webcomponent';
import type { Route } from '@blue/router';
import { ViewsAppConfiguration } from './views-app-configuration';
import './components/shell-component';

const viewsContext = new MetadataConfigApplicationContext('blue-views');
viewsContext.register(WebAutoConfiguration);
viewsContext.register(ViewsAppConfiguration);
viewsContext.refresh();

// The real app renders into #app (tests provide their own view target).
viewsContext.setValue('viewTarget', new DOMElementViewTarget(document.getElementById('app')));

const dispatcher = new BrowserDispatcher();
dispatcher.initStrategies(viewsContext);
dispatcher.applicationContext = viewsContext;

const router = new HashRouter((route: Route) => {
    dispatcher.dispatch(route);
});

if (location.hash === '#/') {
    router.refresh();
} else {
    location.hash = '/';
}
