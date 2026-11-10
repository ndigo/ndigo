---
name: ndigo-verify
description: Runs the project's verification lanes and interprets their output. Use before finishing a change, when a check fails, or when choosing the narrowest verification.
---

# Verification

## Decision table

| Question                       | Command                                |
| :----------------------------- | :------------------------------------- |
| Types                          | `ndigo typecheck`                      |
| Lint and repo rules            | `ndigo lint`                           |
| Tests                          | `ndigo test`                           |
| Build                          | `ndigo build`                          |
| Environment / workspace health | `ndigo doctor`                         |
| Routes and mappings            | `ndigo inspect`, `ndigo routes --json` |
| CLI surface for an agent       | `ndigo commands --json`                |

`lint` and `typecheck` accept `--json` (`{ target, exitCode, stdout, stderr }`);
the other machine-readable commands emit one JSON document on stdout.

## Sequence

1. Run the narrowest check that exercises the change.
2. Read the exit code: `0` ok, `1` runtime/test failure, `2` usage.
3. Fix the cause, not the output. Never suppress a failing check to make the
   lane green.
4. Finish with `ndigo lint && ndigo typecheck && ndigo test`.

## Traps

- **A failing lane is the reproduction.** Do not rerun it to confirm; use the
  output it already produced.
- **Script fronts propagate exit codes.** A green `ndigo test` means the app's
  script exited 0, not that the CLI inspected the results.
- **Generated content is not hand-edited.** Registry files and
  `.agents/skills/` are regenerated; edit the source, then regenerate.

## Verify

Every lane you claim to have run is actually green in this session; report the
narrowest command that proves the change.
