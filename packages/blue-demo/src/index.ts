import { BrowserDispatcher } from '@blue/dispatcher';
import { HashRouter } from '@blue/router';
import todoContext from './todo-context';
import './todo-app-view';
import './todo-input-view';
import './todo-item-view';

const dispatcher = new BrowserDispatcher();
//new HashRouter( ( route ) => dispatcher.dispatch( route ) );
dispatcher.initStrategies(todoContext);

location.hash = '/index';
