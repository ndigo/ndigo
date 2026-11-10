[**create-ndigo-app v0.0.1**](../../README.md)

***

[create-ndigo-app](../../README.md) / [ui-pointer](../README.md) / UI\_AGENTS\_SECTION

# Variable: UI\_AGENTS\_SECTION

> `const` **UI\_AGENTS\_SECTION**: "\\n## Design system\\n\\nThis app uses the Ndigo design system. \`src/styles.css\` imports the \`--nd-\*\`\\ntokens from \`@ndigo/ui\`; style with those tokens (\`var(--nd-color-surface)\`,\\n\`var(--nd-space-4)\`) rather than literal values. Components install as copy-in\\nsource with \`ndigo ui add \<item\>\` (see \`ndigo ui list\`); \`ndigo.ui.json\`\\nrecords the registry and the \`@ui\`/\`@lib\`/\`@components\`/\`@hooks\` aliases.\\n"

The AGENTS.md section appended when an agent bootstrap and the design system
are both requested. It is scaffold-time content, not part of the managed
`tools/agent-content/` block the CLI owns.
