/**
 * Per-item gzip budget guard: a registry item may not grow past its recorded
 * budget without the author updating `meta.json`.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';

interface ItemBudget {
    readonly meta: string;
    readonly files: readonly string[];
}

const PACKAGE_ROOT = [resolve(process.cwd(), 'packages/ndigo-ui'), resolve(process.cwd())].find((candidate) =>
    existsSync(join(candidate, 'registry'))
);

if (!PACKAGE_ROOT) {
    throw new Error(`Cannot locate packages/ndigo-ui from ${process.cwd()}`);
}

const ITEMS: readonly ItemBudget[] = [
    { meta: 'registry/base/meta.json', files: ['registry/base/base-element.ts', 'registry/base/zag-element.ts'] },
    {
        meta: 'registry/blocks/app-shell/meta.json',
        files: ['registry/blocks/app-shell/app-shell.html', 'registry/blocks/app-shell/app-shell.css'],
    },
    {
        meta: 'registry/blocks/sidebar/meta.json',
        files: ['registry/blocks/sidebar/sidebar.html', 'registry/blocks/sidebar/sidebar.css'],
    },
    {
        meta: 'registry/blocks/code-block/meta.json',
        files: [
            'registry/blocks/code-block/code-block.html',
            'registry/blocks/code-block/code-block.css',
            'registry/blocks/code-block/code-block.ts',
        ],
    },
    {
        meta: 'registry/blocks/data-table/meta.json',
        files: [
            'registry/blocks/data-table/data-table.html',
            'registry/blocks/data-table/data-table.css',
            'registry/blocks/data-table/data-table.ts',
        ],
    },
    {
        meta: 'registry/blocks/command/meta.json',
        files: [
            'registry/blocks/command/command.html',
            'registry/blocks/command/command.css',
            'registry/blocks/command/command.ts',
        ],
    },
    {
        meta: 'registry/ui/button/meta.json',
        files: ['registry/ui/button/nd-button.css'],
    },
    {
        meta: 'registry/ui/breadcrumb/meta.json',
        files: ['registry/ui/breadcrumb/nd-breadcrumb.css'],
    },
    {
        meta: 'registry/ui/kbd/meta.json',
        files: ['registry/ui/kbd/nd-kbd.css'],
    },
    {
        meta: 'registry/ui/aspect-ratio/meta.json',
        files: ['registry/ui/aspect-ratio/nd-aspect-ratio.css'],
    },
    {
        meta: 'registry/ui/item/meta.json',
        files: ['registry/ui/item/nd-item.css'],
    },
    {
        meta: 'registry/ui/typography/meta.json',
        files: ['registry/ui/typography/nd-typography.css'],
    },
    {
        meta: 'registry/ui/alert/meta.json',
        files: ['registry/ui/alert/nd-alert.css'],
    },
    {
        meta: 'registry/ui/badge/meta.json',
        files: ['registry/ui/badge/nd-badge.css'],
    },
    {
        meta: 'registry/ui/card/meta.json',
        files: ['registry/ui/card/nd-card.css'],
    },
    {
        meta: 'registry/ui/separator/meta.json',
        files: ['registry/ui/separator/nd-separator.css'],
    },
    {
        meta: 'registry/ui/skeleton/meta.json',
        files: ['registry/ui/skeleton/nd-skeleton.css'],
    },
    {
        meta: 'registry/ui/spinner/meta.json',
        files: ['registry/ui/spinner/nd-spinner.css'],
    },
    {
        meta: 'registry/ui/table/meta.json',
        files: ['registry/ui/table/nd-table.css'],
    },
    {
        meta: 'registry/ui/file-upload/meta.json',
        files: ['registry/ui/file-upload/nd-file-upload.ts', 'registry/ui/file-upload/nd-file-upload.css'],
    },
    {
        meta: 'registry/ui/tags-input/meta.json',
        files: ['registry/ui/tags-input/nd-tags-input.ts', 'registry/ui/tags-input/nd-tags-input.css'],
    },
    {
        meta: 'registry/ui/navigation-menu/meta.json',
        files: [
            'registry/ui/navigation-menu/nd-navigation-menu.ts',
            'registry/ui/navigation-menu/nd-navigation-menu.css',
        ],
    },
    {
        meta: 'registry/ui/pagination/meta.json',
        files: ['registry/ui/pagination/nd-pagination.css'],
    },
    {
        meta: 'registry/ui/scroll-area/meta.json',
        files: ['registry/ui/scroll-area/nd-scroll-area.ts', 'registry/ui/scroll-area/nd-scroll-area.css'],
    },
    {
        meta: 'registry/ui/date-picker/meta.json',
        files: ['registry/ui/date-picker/nd-date-picker.ts', 'registry/ui/date-picker/nd-date-picker.css'],
    },
    {
        meta: 'registry/ui/drawer/meta.json',
        files: ['registry/ui/drawer/nd-drawer.ts', 'registry/ui/drawer/nd-drawer.css'],
    },
    {
        meta: 'registry/ui/combobox/meta.json',
        files: ['registry/ui/combobox/nd-combobox.ts', 'registry/ui/combobox/nd-combobox.css'],
    },
    {
        meta: 'registry/ui/select/meta.json',
        files: ['registry/ui/select/nd-select.ts', 'registry/ui/select/nd-select.css'],
    },
    {
        meta: 'registry/ui/slider/meta.json',
        files: ['registry/ui/slider/nd-slider.ts', 'registry/ui/slider/nd-slider.css'],
    },
    {
        meta: 'registry/ui/switch/meta.json',
        files: ['registry/ui/switch/nd-switch.ts', 'registry/ui/switch/nd-switch.css'],
    },
    {
        meta: 'registry/ui/toast/meta.json',
        files: ['registry/ui/toast/nd-toast.ts', 'registry/ui/toast/nd-toast.css'],
    },
    {
        meta: 'registry/ui/accordion/meta.json',
        files: ['registry/ui/accordion/nd-accordion.ts', 'registry/ui/accordion/nd-accordion.css'],
    },
    {
        meta: 'registry/ui/popover/meta.json',
        files: ['registry/ui/popover/nd-popover.ts', 'registry/ui/popover/nd-popover.css'],
    },
    {
        meta: 'registry/ui/tabs/meta.json',
        files: ['registry/ui/tabs/nd-tabs.ts', 'registry/ui/tabs/nd-tabs.css'],
    },
    {
        meta: 'registry/ui/tooltip/meta.json',
        files: ['registry/ui/tooltip/nd-tooltip.ts', 'registry/ui/tooltip/nd-tooltip.css'],
    },
    {
        meta: 'registry/ui/checkbox/meta.json',
        files: ['registry/ui/checkbox/nd-checkbox.css'],
    },
    {
        meta: 'registry/ui/field/meta.json',
        files: ['registry/ui/field/nd-field.css'],
    },
    {
        meta: 'registry/ui/input/meta.json',
        files: ['registry/ui/input/nd-input.css'],
    },
    {
        meta: 'registry/ui/dialog/meta.json',
        files: ['registry/ui/dialog/nd-dialog.ts', 'registry/ui/dialog/nd-dialog.css'],
    },
    {
        meta: 'registry/ui/menu/meta.json',
        files: ['registry/ui/menu/nd-menu.ts', 'registry/ui/menu/nd-menu.css'],
    },
];

describe('registry item budgets', () => {
    for (const item of ITEMS) {
        it(`keeps ${item.meta} within its recorded gzip budget`, () => {
            const meta = JSON.parse(readFileSync(join(PACKAGE_ROOT, item.meta), 'utf8')) as { gzipBytes: number };
            const payload = Buffer.concat(item.files.map((file) => readFileSync(join(PACKAGE_ROOT, file))));
            const actual = gzipSync(payload, { level: 9 }).byteLength;

            expect(meta.gzipBytes).toBeGreaterThan(0);
            expect(actual).toBeLessThanOrEqual(Math.ceil(meta.gzipBytes * 1.05));
        });
    }
});
