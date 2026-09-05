const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

const packages = [
    'packages/blue-core',
    'packages/blue-util',
    'packages/blue-context',
    'packages/blue-router',
    'packages/blue-view',
    'packages/blue-http',
    'packages/blue-model',
    'packages/blue-logger',
    'packages/blue-content',
    'packages/blue-domain',
    'packages/blue-validate',
    'packages/blue-print',
    'packages/blue-boot',
    'packages/blue-service',
    'packages/blue-dispatcher',
    'packages/blue-view-webcomponent',
    'packages/blue-platform-web',
    'packages/blue-factory',
    'packages/blue-parser',
];

async function migrateFile(filePath) {
    let content = await fs.readFile(filePath, 'utf-8');
    let originalContent = content;
    let isClassFile = /class\s+\w+/.test(content);

    // Remove inferred tags
    content = content.replace(/ \* @(function|class|interface|const|member|module) .*\n/g, '');

    // Convert specific tags to @see with links
    content = content.replace(/ \* @(requires|mixes|mixin)\s+([^ \n\r]+)/g, (match, tag, value) => {
        const member = value.includes('.') ? value.split('.')[1] : value;
        return ` * @see {@link ${member}}`;
    });
    content = content.replace(/ \* @todo\s+(.*)\n/g, ' * @remarks TODO: $1\n');
    content = content.replace(/ \* @classdesc\s*\n/g, ' '); // Absorb @classdesc

    // Handle @implements
    if (!isClassFile) {
        content = content.replace(/ \* @implements\s+(.*)\n/g, ' * @see Implements: {@link $1}\n');
    }

    // Clean types and standardize return
    content = content.replace(/\{external:([^}]+)\}/g, '{$1}');
    content = content.replace(/@return\b/g, '@returns');
    content = content.replace(/@linkcode\b/g, '@link');

    // More robust link replacement
    content = content.replace(/\{@link module:[^.]+\.([^}|]+)\|?([^}]*)\}/g, (match, member, text) => {
        const cleanMember = member.replace(/#/, '.');
        return `{@link ${text || cleanMember}}`;
    });
    content = content.replace(/\{@link module:[^.]+\.([^}]+)\}/g, '{@link $1}');

    if (content !== originalContent) {
        console.log(`Migrating ${filePath}`);
        await fs.writeFile(filePath, content, 'utf-8');
        return true;
    }
    return false;
}

async function main() {
    const fileLists = await Promise.all(packages.map((pkg) => glob(path.join(pkg, 'src/**/*.ts'))));
    const files = fileLists.flat();
    const migrated = await Promise.all(files.map((file) => migrateFile(file)));
    const migratedCount = migrated.filter(Boolean).length;
    console.log(`\nMigration complete. Updated ${migratedCount} additional files.`);
}

main().catch(console.error);
