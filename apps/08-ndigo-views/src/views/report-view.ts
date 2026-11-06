/**
 */
import { StringTemplateView } from '@ndigo/view';

/**
 * The demo's module-on-disk view location: the module's default export IS the
 * view class. The path-based resolver (see report-view-resolver.ts)
 * dynamic-imports it and instantiates the default export (ImportViewResolver
 * semantics), so loading stays lazy.
 */

export default class ReportView extends StringTemplateView {
    constructor() {
        super();
        this.mediaType = null;
        this.template = `<section class="report">
    <h2>Report</h2>
    <p>Rendered by a view module on disk, imported on first resolution.</p>
</section>`;
    }
}
