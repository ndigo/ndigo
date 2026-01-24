import { BrowserDispatcher } from '@blue/dispatcher';
import todoContext from './todo-context';
import './todo-app-view';
import './todo-input-view';
import './todo-item-view';
const dispatcher = new BrowserDispatcher();
//new HashRouter( ( route ) => dispatcher.dispatch( route ) );
dispatcher.initStrategies(todoContext);
location.hash = '/index';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFckQsT0FBTyxXQUFXLE1BQU0sZ0JBQWdCLENBQUM7QUFDekMsT0FBTyxpQkFBaUIsQ0FBQztBQUN6QixPQUFPLG1CQUFtQixDQUFDO0FBQzNCLE9BQU8sa0JBQWtCLENBQUM7QUFFMUIsTUFBTSxVQUFVLEdBQUcsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO0FBQzNDLDhEQUE4RDtBQUM5RCxVQUFVLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBRXZDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDIn0=