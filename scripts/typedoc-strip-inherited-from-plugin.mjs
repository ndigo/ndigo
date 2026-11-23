/**
 * TypeDoc plugin: drop the `inheritedFrom`/mixin-chain `overwrites` attribution
 * from every reflection.
 *
 * Ndigo composes behaviour through mixin factory classes such as
 * `AsRouteHandlerAdapterStrategy(AsStrategyInitializer(Null))`. TypeDoc records
 * the full composition chain as a reflection's `inheritedFrom` (and as the
 * `overwrites` source for overridden members), which renders as a nonsensical,
 * deeply-nested "Inherited from"/"Overrides" line on every member page.
 * The member is still documented and shown; only the noisy provenance is
 * removed. Real (single-class) overrides are preserved.
 */
/** @param {import('typedoc').Application} app */
export function load(app) {
    app.converter.on('end', (context) => {
        const project = context.project;
        if (!project) return;
        const visit = (reflection) => {
            if (!reflection) return;
            if (reflection.inheritedFrom) reflection.inheritedFrom = undefined;
            if (reflection.overwrites) {
                const s = String(reflection.overwrites);
                if (/As[A-Z][A-Za-z]*\(/.test(s)) reflection.overwrites = undefined;
            }
            if (Array.isArray(reflection.signatures)) {
                for (const sig of reflection.signatures) visit(sig);
            }
            if (Array.isArray(reflection.children)) {
                for (const child of reflection.children) visit(child);
            }
            if (Array.isArray(reflection.parameters)) {
                for (const param of reflection.parameters) visit(param);
            }
            if (reflection.type && typeof reflection.type === 'object') {
                // type may carry declaration references; nothing to clear here
            }
        };
        visit(project);
    });
}
