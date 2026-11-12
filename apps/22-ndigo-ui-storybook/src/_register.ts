/**
 * Registers every registry component once for the preview.
 *
 * The globs live in a normal module because Storybook's config pipeline does
 * not run Vite's `import.meta.glob` transform over `.storybook/preview.ts`.
 * Stylesheets are imported before element modules so a story never renders
 * unstyled.
 *
 * `@ndigo/ui` declares CSS as its only side-effectful files, so Rollup treats
 * the registry's element modules as pure and drops an eager glob whose result
 * is unused. The count assertion below is both a real guard (a broken glob path
 * would otherwise surface as unupgraded, method-less elements) and the use that
 * keeps the registrations in the bundle.
 *
 * The casts exist because `vite/client` is not referenced globally: its asset
 * module declarations collide with the repo's ambient http fixtures. After
 * esbuild erases the types each call is a plain `import.meta.glob`, which is
 * exactly what Vite's glob transform requires.
 */
interface GlobImportMeta {
    glob(pattern: string, options: { eager: true }): Record<string, unknown>;
}

(import.meta as unknown as GlobImportMeta).glob('../../../packages/ndigo-ui/registry/ui/**/*.css', {
    eager: true,
});
(import.meta as unknown as GlobImportMeta).glob('../../../packages/ndigo-ui/registry/blocks/**/*.css', {
    eager: true,
});

const ELEMENTS = {
    ...(import.meta as unknown as GlobImportMeta).glob('../../../packages/ndigo-ui/registry/ui/**/*.ts', {
        eager: true,
    }),
    ...(import.meta as unknown as GlobImportMeta).glob('../../../packages/ndigo-ui/registry/blocks/**/*.ts', {
        eager: true,
    }),
};

if (Object.keys(ELEMENTS).length === 0) {
    throw new Error('No registry element modules matched the glob paths in src/_register.ts.');
}
