/**
 * TypeDoc plugin: register BlueJS framework decorators and custom doc tags as
 * known block/inline tags so `pnpm doc` emits zero "unknown tag" warnings.
 */

/** Tags appearing in BlueJS source JSDoc that TypeDoc doesn't know by default. */
const CUSTOM_TAGS = [
    'classdesc',
    'configuration',
    'counted',
    'description',
    'domainAction',
    'domainData',
    'entry',
    'errorHandler',
    'errorMapping',
    'requestMapping',
    'routeMapping',
    'parameters',
    'security',
    'traced',
];

/** @param {import('typedoc').Application} app */
export function load(app) {
    const current = app.options.getValue('blockTags');
    app.options.setValue('blockTags', [...current, ...CUSTOM_TAGS.map((tag) => `@${tag}`)]);
}
