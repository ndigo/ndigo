import { BrowserDispatcher } from '@blue/dispatcher';
import { HashRouter, Route } from '@blue/router';
import todoContext from './todo-context';
import './todo-app-view';
import './todo-input-view';
import './todo-item-view';

const dispatcher = new BrowserDispatcher();
const router = new HashRouter((route: Route) => dispatcher.dispatch(route));
dispatcher.initStrategies(todoContext);
todoContext.setValue('router', router);
todoContext.setValue('dispatcher', dispatcher);

location.hash = '/index';
