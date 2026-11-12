/**
 */
import '@tsmetadata/polyfill';
import { configuration, entry } from '@ndigo/context';
import { StaticContentSource } from '@ndigo/content';
import { NameViewResolver } from '@ndigo/view';
import { WebComponentViewResolver } from '@ndigo/view-webcomponent';
import ViewsController from './views-controller';
import { NdigoViewsShell } from './components/shell-component';
import { ClientDemoComponent } from './components/client-demo';
import { FooterView } from './views/footer-view';
import { ReportViewResolver } from './report-view-resolver';

/**
 * Ndigo Views — the composite resolver demo.
 *
 * The app configures its own resolver chain (the conventional layering) proving
 * three view locations behind one ordered composite:
 *
 *   1. WebComponentViewResolver — component module (eager registry:
 *      logical name `shell` → class → `@TagMapping` tag).
 *   2. NameViewResolver — a plain View entry registered in the context
 *      (`footer`).
 *   3. ReportViewResolver — a path-based resolver that imports a view module
 *      on first resolution (`report` → `views/report-view.ts`).
 *
 * First match wins; `nope` matches none → chain fall-through → NoViewFound.
 */
@configuration
export class ViewsAppConfiguration {
    @entry()
    viewsController() {
        return new ViewsController(
            new StaticContentSource({
                footer: {
                    en: 'Built with Ndigo',
                    de: 'Gebaut mit Ndigo',
                    fr: 'Construit avec Ndigo',
                },
            })
        );
    }

    /** Context-entry view for NameViewResolver. */
    @entry()
    footer() {
        return new FooterView();
    }

    @entry()
    viewResolvers() {
        return [
            // viewNames filter: only the component names resolve here —
            // `nope` falls through to the next resolvers (first-match-wins
            // chain).
            new WebComponentViewResolver({
                registry: { shell: NdigoViewsShell, clientDemo: ClientDemoComponent },
                viewNames: [/^shell$/, /^clientDemo$/],
            }),
            new NameViewResolver(),
            new ReportViewResolver(),
        ];
    }
}
