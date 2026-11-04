/**
 * @module ndigo-views
 * @since 1.0.0
 * @author Jeff Rose
 */
import { StringTemplateView } from '@ndigo/view';

/**
 * The demo's context-bean view location: a plain view registered in the
 * application context under the name `footer` and resolved by
 * `NameViewResolver` (bean-name resolution, Spring's BeanNameViewResolver).
 *
 * The controller passes a localized `message` + `language` (from
 * `@ndigo/content` `ContentSource` — see ViewsController); the template
 * interpolates them.
 */

export class FooterView extends StringTemplateView {
    constructor() {
        super();
        this.mediaType = null;
        this.template =
            '<footer>Resolved by NameViewResolver from the application context — ' +
            '{{language}}: {{message}}</footer>';
    }
}
