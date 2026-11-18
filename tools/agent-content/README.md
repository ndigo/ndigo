# `agent-content/`

The authored store for Ndigo's agent-facing content.

| Path                        | Role                                                                                                                                            |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `instructions/ndigo.md`     | Managed `AGENTS.md` block body written by `ndigo ai init`.                                                                                      |
| `instructions/bootstrap.md` | Pointer emitted into scaffolded apps' `AGENTS.md`.                                                                                              |
| `skills/`                   | **Vendored snapshot** of [ndigo-skills](https://github.com/ndigo/ndigo-skills), pinned by `skills.lock.json` (source commit + per-file hashes). |
| `docs-index.md`             | Generated index of guides and packages, bundled for agents (never edit).                                                                        |
| `.agent-content.json`       | Generated sha256 manifest over every emitted file (CI gate, never edit).                                                                        |

## Commands

```bash
pnpm agent-content:sync    # refresh the skills snapshot from ../ndigo-skills
pnpm agent-content:build   # emit CLI assets and create-ndigo-app templates
pnpm agent-content:check   # verify the snapshot and emitted files (CI)
```

`build.mjs` refuses to emit while the snapshot drifts from `skills.lock.json`.
Never edit `skills/` by hand: change the canonical repo, merge there, then run
`agent-content:sync`. The sync source defaults to the sibling
`../ndigo-skills` checkout and can be overridden with `NDIGO_SKILLS_DIR`; it
must be clean so the recorded commit identifies the content exactly.
