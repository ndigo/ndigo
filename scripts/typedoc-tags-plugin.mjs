/**
 * TypeDoc plugin: register BlueJS framework decorators and custom doc tags as
 * known block/inline tags so `pnpm doc` emits zero "unknown tag" warnings.
 */

/* eslint-disable @blue/no-string-registry-lookup -- TypeDoc's Application.options exposes a getValue/setValue pair (an option bag, not the Blue registry); the AD-34 rule is method-name scoped in v1 and receiver typing is out of scope. */

/** Tags appearing in BlueJS source JSDoc that TypeDoc doesn't know by default. */
const CUSTOM_TAGS = [
    'configuration',
    'counted',
    'entry',
    'errorMapping',
    'requestMapping',
    'routeMapping',
    'parameters',
    'traced',
];

/** @param {import('typedoc').Application} app */
export function load(app) {
    const current = app.options.getValue('blockTags');
    app.options.setValue('blockTags', [...current, ...CUSTOM_TAGS.map((tag) => `@${tag}`)]);
}
