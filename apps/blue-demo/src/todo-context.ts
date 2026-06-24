import { configuration, entry } from '@blue/context';
import { ApplicationBuilder } from '@blue/boot';
import { LoggingRouteHandlerInterceptor, LinearMetadataHandlerMapping } from '@blue/dispatcher';
import { getLogger } from '@blue/telemetry';
import { NameViewResolver } from '@blue/view';
import { DOMElementViewTarget, WebComponentViewEngine } from '@blue/view-webcomponent';
import AccountController from './account-controller';
import IndexController from './index-controller';
import NotesController from './notes-controller';
import AccountApp from './account-app-view';
import MyTodoApp from './todo-app-view';
import NotesService from './notes-service';
import TodoService from './todo-service';
import { StaticContentSource } from '@blue/content';
import { LoginView } from './login-view';
import { ProfileView } from './profile-view';
import { AdminView } from './admin-view';
import { ForbiddenView } from './forbidden-view';

@configuration
class ToDoconfiguration {
    @entry
    accountApp() {
        return new AccountApp();
    }

    @entry
    accountController() {
        return new AccountController();
    }

    @entry
    todoApp() {
        return new MyTodoApp();
    }

    @entry
    indexController() {
        return new IndexController();
    }

    @entry
    handlerMapping() {
        // TODO Fix the default handler mappings
        const mapping = new LinearMetadataHandlerMapping();
        mapping.interceptors.push(new LoggingRouteHandlerInterceptor(getLogger('blue-demo:dispatcher')));
        return mapping;
    }

    @entry
    viewResolver() {
        return new NameViewResolver();
    }

    @entry
    viewTarget() {
        const target = new DOMElementViewTarget(document.getElementById('app'));
        target.setEventMap({
            onSubmit: 'user:todo:created',
            onRemove: 'user:todo:removed',
            onToggle: 'user:todo:toggled',
        });
        return target;
    }

    @entry
    webComponentViewEngine() {
        return new WebComponentViewEngine();
    }

    @entry
    todoService() {
        return new TodoService([
            { text: 'my initial todo', checked: false },
            { text: 'Learn about Web Components', checked: true },
        ]);
    }

    @entry
    notesController() {
        return new NotesController();
    }

    @entry
    notesService() {
        return new NotesService([
            {
                id: '1',
                title: 'Welcome to Wicket Views',
                body: 'This note is rendered using @blue/view-wicket.',
                pinned: true,
            },
            { id: '2', title: 'Component Tree', body: 'Page → Panel → ListView → Label hierarchy.', pinned: false },
        ]);
    }

    // ── Auth views ────────────────────────────────────────────────────────────
    @entry
    loginView() {
        return new LoginView();
    }

    @entry
    profileView() {
        return new ProfileView();
    }

    @entry
    adminView() {
        return new AdminView();
    }

    @entry
    forbiddenView() {
        return new ForbiddenView();
    }
}

export const createTodoContext = () => {
    const context = new ApplicationBuilder([ToDoconfiguration]).run();

    // Configure content source for localized strings
    context.setContentSource(
        new StaticContentSource(
            {
                'notes.page.title': { en: 'Notes', fr: 'Notes' },
                'notes.btn.add': { en: 'Add Note', fr: 'Ajouter une note' },
                'notes.btn.remove': { en: 'Remove', fr: 'Supprimer' },
                'notes.empty': { en: 'No notes yet.', fr: 'Aucune note pour le moment.' },
            },
            'en'
        )
    );

    return context;
};
