import '@tsmetadata/polyfill';
import { configuration, entry } from '@blue/context';
import { NameViewResolver } from '@blue/view';
import { WebComponentViewResolver } from '@blue/view-webcomponent';
import ViewsController from './views-controller';
import { BlueViewsShell } from './components/shell-component';
import { FooterView } from './views/footer-view';
import { ReportViewResolver } from './report-view-resolver';

/**
 * Blue Views — the composite resolver demo.
 *
 * The app configures its own resolver chain (Spring's convention) proving
 * three view locations behind one ordered composite:
 *
 *   1. WebComponentViewResolver — component module (eager registry:
 *      logical name `shell` → class → `@TagMapping` tag).
 *   2. NameViewResolver — a plain View bean registered in the context
 *      (`footer`).
 *   3. ReportViewResolver — a path-based resolver that imports a view module
 *      on first resolution (`report` → `views/report-view.ts`).
 *
 * First match wins; `nope` matches none → chain fall-through → NoViewFound.
 */
@configuration
export class ViewsAppConfiguration {
    @entry
    viewsController() {
        return new ViewsController();
    }

    /** Context-bean view for NameViewResolver. */
    @entry
    footer() {
        return new FooterView();
    }

    @entry
    viewResolvers() {
        return [
            // viewNames filter: only `shell` resolves here — `nope` falls
            // through to the next resolvers (first-match-wins chain).
            new WebComponentViewResolver({ registry: { shell: BlueViewsShell }, viewNames: [/^shell$/] }),
            new NameViewResolver(),
            new ReportViewResolver(),
        ];
    }
}
