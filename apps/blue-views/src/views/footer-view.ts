import { StringTemplateView } from '@blue/view';

/**
 * The demo's context-bean view location: a plain view registered in the
 * application context under the name `footer` and resolved by
 * `NameViewResolver` (bean-name resolution, Spring's BeanNameViewResolver).
 */

export class FooterView extends StringTemplateView {
    constructor() {
        super();
        this.mediaType = null;
        this.template = '<footer>Resolved by NameViewResolver from the application context.</footer>';
    }
}
