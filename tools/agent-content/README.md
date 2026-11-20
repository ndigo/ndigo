# `agent-content/`

The authored store for Ndigo's agent-facing content.

| Path                        | Role                                                                                                                                                                                                                                                              |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `instructions/ndigo.md`     | Managed `AGENTS.md` block body written by `ndigo ai init`.                                                                                                                                                                                                        |
| `instructions/bootstrap.md` | Pointer emitted into scaffolded apps' `AGENTS.md`.                                                                                                                                                                                                                |
| `skills/`                   | **Vendored snapshot** of [ndigo-skills](https://github.com/ndigo/ndigo-skills), pinned by `skills.lock.json` (source commit + per-file hashes). A skill's optional `package` frontmatter field names the workspace package that ships it (see "Emitted outputs"). |
| `docs-index.md`             | Generated index of guides and packages, bundled for agents (never edit).                                                                                                                                                                                          |
| `.agent-content.json`       | Generated sha256 manifest over every emitted file (CI gate, never edit).                                                                                                                                                                                          |

## Emitted outputs

`build.mjs` writes, and `agent-content:check` gates:

- `packages/ndigo-cli/assets/agent/**` — the version-matched CLI assets
  (`instructions.md`, `docs-index.md`, and every skill). These stay
  authoritative for every skill.
- `packages/create-ndigo-app/templates/*/AGENTS.md.template` — the scaffold
  bootstrap pointer.
- `packages/<pkg>/docs/llms.txt` — a compressed export index for every
  package, generated from committed inputs only (`package.json`, the README,
  and the `src/index.ts` re-export graph; no build or TypeDoc run).
- `packages/<pkg>/skills/<id>/SKILL.md` — for every skill whose frontmatter
  declares a `package`; the read fallback for direct dependencies.
- `.agent-content.json` — the drift manifest. The check also asserts that
  each package's `files` list covers its emitted `docs/` (and `skills/`), and
  removes stale per-package skill directories when a `package` field changes.

## Commands

```bash
pnpm agent-content:sync    # refresh the skills snapshot from ../ndigo-skills
pnpm agent-content:build   # emit CLI assets, templates, llms.txt, and skills
pnpm agent-content:check   # verify the snapshot and emitted files (CI)
```

`build.mjs` refuses to emit while the snapshot drifts from `skills.lock.json`.
Never edit the snapshot or any emitted artifact by hand: change the canonical
`ndigo-skills` repo, merge there, then run `agent-content:sync`. The sync
source defaults to the sibling `../ndigo-skills` checkout and can be
overridden with `NDIGO_SKILLS_DIR`; it must be clean so the recorded commit
identifies the content exactly.
