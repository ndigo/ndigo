# CI Cost and Runners

How the repository spends GitHub Actions minutes, why the spend is what it is,
and the switches that keep it inside the free tier. Tracking issue: #276.

## Budget model

The repository is private on the GitHub **Free** plan: **2,000 included
`ubuntu-latest` minutes per calendar month**, then a hard stop. The default
spending limit is `$0`, so usage does not silently roll into overage — workflows
simply stop accepting jobs mid-PR.

Billing is per **job**, not per step: a job bills its whole wall-clock duration
rounded up to the minute, cancelled jobs bill the portion they ran, and a job
that fails in five seconds still bills one minute.

Dependabot's own update jobs (`dynamic` event) run on GitHub infrastructure and
never bill. Workflows that Dependabot's PRs _trigger_ do bill, which is why those
PRs arrive labelled `parked` (see `ci.yml`).

## Measured baseline

Trailing 30 days ending 2026-11-09, replayed from the runs API:

| Workflow | Runs | Billable minutes |
| -------- | ---- | ---------------- |
| CI       | 311  | 2,540            |
| Docs     | 231  | 231              |

Within a successful `quality` job, one step dominated: `Unit + integration
tests` at ~9.1 of ~13.2 minutes. Build was 0.5, typecheck 0.4, API docs 1.9.

Two structural causes:

1. **The Nx task cache never persisted.** The workflow cached `.nx/cache`, but
   Nx 24 resolves its cache to `~/.nx/<workspace-id>/cache` (see
   `node_modules/nx/dist/src/utils/cache-directory.js` → `sharedDataDirectory`).
   The action logged `Cache not found` and never saved, so every run rebuilt all
   43 libraries and re-ran all 69 test projects from cold. The `Cache: 43/112`
   hits visible in logs were all `build:lib` replaying from the earlier
   `pnpm build` step **inside the same job**.
2. **Run count inflated by `docs/*` branches.** The TSDoc batches edit comments
   in `packages/*/src`, so each push to those PRs pays the full lane; several
   branches pushed eight times.

## What the workflow does now

| Control                                                      | Effect                                                                                                                                |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `runs-on: fromJSON(vars.CI_RUNNER \|\| '["ubuntu-latest"]')` | One repository variable moves the quality lane between hosted and self-hosted                                                         |
| `vars.CI_RUNNER_E2E`                                         | Opt-in for the browser lane only; the runner installer preinstalls Chromium's system libraries, so `--with-deps` is skipped there     |
| `nx affected -t test --base=<PR base>` on PRs                | Only changed projects and their dependents run; full suite on schedule/dispatch                                                       |
| `~/.nx` cache restore; save only from schedule/dispatch/main | Correct Nx path; PR pushes no longer upload a multi-hundred-MB entry each run                                                         |
| Draft PRs skipped                                            | WIP pushes cost nothing; `ready_for_review` starts the lane                                                                           |
| e2e gated on browser-facing paths                            | `apps/`, `ndigo-{dom,http,ui,signals,boot,view*}`, lockfile, toolchain; weekly sweep covers the rest                                  |
| `Docs` on open/promote only                                  | One billed minute per docs PR instead of one per push                                                                                 |
| `pnpm preflight` + pre-push hook                             | The lane runs on the machine that wrote the code                                                                                      |
| Redis on host 6380; smoke probes on 14xxx on the runner      | A self-hosted job shares the host network, so it never fights a local dev server or a concurrent preflight for 6379/4xxx (issue #283) |

## Self-hosted runner

Host setup lives outside the repository (it needs `sudo`). Two idempotent
scripts, each with an undo twin:

- `~/bin/ci-runner-install.sh` (undo `~/bin/undo-ci-runner-install-20261109.sh`)
  registers an unprivileged `ghrunner` account, installs the runner under
  `/opt/actions-runner`, provisions Node 24 at `/opt/node24` and prepends it to
  the runner's `.path`, adds `ghrunner` to the `docker` group, and starts the
  systemd unit. `INSTALL_BROWSER_DEPS=1` additionally installs Chromium's
  shared libraries for the e2e lane.
- `~/bin/ci-runner-docker.sh` (undo `~/bin/undo-ci-runner-docker-20261109.sh`)
  enables the `docker` snap daemon on `/var/run/docker.sock`. Docker Desktop's
  engine socket is per-user (`~/.docker/desktop/`) and unreachable by
  `ghrunner`, so the system daemon is what makes the `services: redis`
  container work — and it starts at boot, not at desktop login.

Node is a prerequisite, not a convenience: `pnpm/action-setup` installs pnpm by
running its preinstall through `sh`, which needs `node` before
`actions/setup-node` has run. A bare host has none, and the first job died with
`sh: 1: node: not found`.

Enable:

```bash
gh variable set CI_RUNNER --body '["self-hosted","linux","x64"]'
```

Fall back to hosted (immediately, no code change):

```bash
gh variable delete CI_RUNNER
```

Properties worth knowing:

- `~/.nx` persists on that machine between runs, so the task cache is warm by
  construction — the cache-path bug above cannot occur there.
- `_work` holds the checkout; the Nx cache holds build outputs. Both live under
  `/home/ghrunner`.
- The first e2e run downloads Chromium into
  `/home/ghrunner/.cache/ms-playwright`; later runs reuse it (the browser lane
  dropped from 125 s to 39 s on the second run).
- Jobs queue while the machine is offline (up to 24 hours) and then fail. The
  hosted fallback exists for that case.
- A runner registration runs **one job at a time**; concurrent PRs queue. There
  is no parallel-jobs setting — capacity means registering another runner
  instance.
- Jobs share the **host network namespace** with local dev sessions, so fixed
  ports are isolated rather than left to chance: Redis publishes on `6380`, and
  `ci.yml` sets `APPS_SMOKE_PORT_OFFSET=10000` for the smoke step so runner
  probes run on 14xxx while a local `pnpm preflight` stays on 4xxx (issue #283).
  e2e still uses 4173/3280 — avoid running those preview servers locally while
  a browser lane is active.
- Every job executes repository code on the developer's machine. The repository
  is private with no forks, which is what makes that acceptable; do not add
  untrusted forks while `CI_RUNNER` is set.

## Ongoing check

```bash
pnpm ci:usage                  # this calendar month
pnpm ci:usage --days 7         # rolling window
pnpm ci:usage --since 2026-11-01 --json
```

The script replays run history and prints billable minutes per workflow, job,
and day against the monthly allowance. Policy: if a rolling 7-day window exceeds
~450 hosted minutes, clear `CI_RUNNER` and investigate before the month ends.
