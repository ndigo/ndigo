#!/usr/bin/env node
/**
 * Reconstruct billable GitHub Actions minutes from the runs API (issue #276).
 *
 * GitHub reports usage per billing cycle, aggregated by plan — not per job —
 * so the only way to see where the budget went is to replay the run history:
 * every completed job bills its wall-clock duration rounded up to the minute,
 * cancelled jobs included, and a job's whole duration is billed even when an
 * early step failed.
 *
 * Dependabot's own update jobs (`dynamic` event) run on GitHub's infrastructure
 * and never bill, so they are excluded. Workflows it *triggers* (a normal
 * `pull_request` run on its branch) do bill and are counted.
 *
 * Usage:
 *   pnpm ci:usage                     # current month
 *   pnpm ci:usage --since 2026-10-01
 *   pnpm ci:usage --days 30 --json
 */

import { execFileSync } from 'node:child_process';

const FREE_TIER_MINUTES = 2000;
const CONDITIONAL_EVENTS = new Set(['dynamic']);

function parseArgs(argv) {
    const options = { since: firstOfMonth(), days: null, json: false, repo: null };
    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        if (arg === '--json') options.json = true;
        else if (arg === '--since') options.since = argv[++index];
        else if (arg === '--days') options.days = Number(argv[++index]);
        else if (arg === '--repo') options.repo = argv[++index];
        else if (arg === '--help' || arg === '-h') {
            console.log('usage: ci-usage [--since YYYY-MM-DD | --days N] [--repo owner/name] [--json]');
            process.exit(0);
        } else {
            console.error(`ci-usage: unknown argument ${arg}`);
            process.exit(2);
        }
    }
    return options;
}

function firstOfMonth() {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-01`;
}

function resolveRepo(explicit) {
    if (explicit) return explicit;
    if (process.env.GITHUB_REPOSITORY) return process.env.GITHUB_REPOSITORY;
    const remote = execFileSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
    const match = remote.match(/github\.com[:/]([^/]+\/[^/.]+)/);
    if (!match) throw new Error(`ci-usage: cannot derive a GitHub repo from ${remote}`);
    return match[1];
}

function resolveToken() {
    if (process.env.GH_TOKEN || process.env.GITHUB_TOKEN) return process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
    return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim();
}

class GitHubClient {
    #token;
    #repo;
    #remaining = Number.POSITIVE_INFINITY;

    constructor(repo, token) {
        this.#repo = repo;
        this.#token = token;
    }

    async request(path) {
        for (let attempt = 0; ; attempt += 1) {
            let response;
            try {
                // eslint-disable-next-line no-await-in-loop -- each retry depends on the previous outcome.
                response = await fetch(`https://api.github.com${path}`, {
                    headers: {
                        authorization: `Bearer ${this.#token}`,
                        accept: 'application/vnd.github+json',
                        'user-agent': 'ndigo-ci-usage',
                    },
                });
            } catch (error) {
                // Transient TLS resets happen on long paginated walks; retry
                // them like an HTTP 5xx rather than losing the whole report.
                if (attempt >= 3) throw error;
                // eslint-disable-next-line no-await-in-loop -- backoff is sequential by definition.
                await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
                continue;
            }
            this.#remaining = Number(response.headers.get('x-ratelimit-remaining') ?? this.#remaining);
            if (response.ok) return response.json();
            const retryable = response.status === 403 || response.status === 429 || response.status >= 500;
            if (!retryable || attempt >= 3) {
                throw new Error(`ci-usage: ${path} -> HTTP ${response.status}`);
            }
            // eslint-disable-next-line no-await-in-loop -- backoff is sequential by definition.
            await new Promise((resolve) => setTimeout(resolve, 2000 * (attempt + 1)));
        }
    }

    async listRuns(since) {
        const runs = [];
        for (let page = 1; ; page += 1) {
            // eslint-disable-next-line no-await-in-loop -- page N+1 exists only if page N filled.
            const body = await this.request(
                `/repos/${this.#repo}/actions/runs?per_page=100&page=${page}&created=${encodeURIComponent(`>=${since}`)}`
            );
            runs.push(...body.workflow_runs);
            if (body.workflow_runs.length < 100) return runs;
        }
    }

    async listJobs(runId) {
        const body = await this.request(`/repos/${this.#repo}/actions/runs/${runId}/jobs?per_page=100`);
        return body.jobs;
    }

    get rateLimitRemaining() {
        return this.#remaining;
    }
}

function billableMinutes(job) {
    if (!job.started_at || !job.completed_at) return 0;
    if (job.conclusion === 'skipped') return 0;
    const elapsed = (Date.parse(job.completed_at) - Date.parse(job.started_at)) / 60000;
    return elapsed > 0 ? Math.max(1, Math.ceil(elapsed)) : 0;
}

async function mapWithConcurrency(items, limit, worker) {
    const results = new Array(items.length);
    let cursor = 0;
    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (cursor < items.length) {
            const index = cursor;
            cursor += 1;
            // eslint-disable-next-line no-await-in-loop -- a slot takes the next item only when it frees up.
            results[index] = await worker(items[index], index);
        }
    });
    await Promise.all(workers);
    return results;
}

function formatTable(rows, headers) {
    const widths = headers.map((header, column) =>
        Math.max(header.length, ...rows.map((row) => String(row[column]).length))
    );
    const line = (row) =>
        row
            .map((cell, column) =>
                column === 0 ? String(cell).padEnd(widths[column]) : String(cell).padStart(widths[column])
            )
            .join('  ');
    return [line(headers), widths.map((width) => '─'.repeat(width)).join('  '), ...rows.map(line)].join('\n');
}

function sum(values) {
    return values.reduce((total, value) => total + value, 0);
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    const since = options.days
        ? new Date(Date.now() - options.days * 86_400_000).toISOString().slice(0, 10)
        : options.since;
    const repo = resolveRepo(options.repo);
    const client = new GitHubClient(repo, resolveToken());

    const runs = await client.listRuns(since);
    if (!options.json) process.stderr.write(`ci-usage: ${runs.length} runs since ${since}, fetching jobs…\n`);

    let completed = 0;
    const jobsByRun = await mapWithConcurrency(runs, 6, async (run) => {
        const jobs = await client.listJobs(run.id);
        completed += 1;
        if (!options.json && completed % 100 === 0) {
            process.stderr.write(`\rci-usage: ${completed}/${runs.length} runs`);
        }
        return jobs;
    });
    if (!options.json) process.stderr.write('\r'.padEnd(40) + '\r');

    const byWorkflow = new Map();
    const byJob = new Map();
    const byDay = new Map();
    const detail = [];

    runs.forEach((run, index) => {
        if (CONDITIONAL_EVENTS.has(run.event)) return;
        const minutes = sum(jobsByRun[index].map(billableMinutes));
        if (minutes === 0) return;

        const workflow = run.name;
        const branch = run.head_branch ?? '(unknown)';
        const day = run.created_at.slice(0, 10);

        byWorkflow.set(workflow, byWorkflow.get(workflow) ?? { runs: 0, minutes: 0 });
        const wf = byWorkflow.get(workflow);
        wf.runs += 1;
        wf.minutes += minutes;

        byDay.set(day, (byDay.get(day) ?? 0) + minutes);

        for (const job of jobsByRun[index]) {
            const jobMinutes = billableMinutes(job);
            if (jobMinutes === 0) continue;
            const key = `${workflow} / ${job.name}`;
            byJob.set(key, byJob.get(key) ?? { runs: 0, minutes: 0 });
            const entry = byJob.get(key);
            entry.runs += 1;
            entry.minutes += jobMinutes;
        }

        detail.push({ workflow, branch, day, minutes, event: run.event });
    });

    const total = sum([...byWorkflow.values()].map((entry) => entry.minutes));
    const runCount = sum([...byWorkflow.values()].map((entry) => entry.runs));
    const days = byDay.size || 1;

    if (options.json) {
        console.log(
            JSON.stringify(
                {
                    repo,
                    since,
                    totalMinutes: total,
                    runs: runCount,
                    freeTierMinutes: FREE_TIER_MINUTES,
                    workflows: Object.fromEntries(byWorkflow),
                    jobs: Object.fromEntries(byJob),
                    days: Object.fromEntries(byDay),
                },
                null,
                2
            )
        );
        return;
    }

    const workflowRows = [...byWorkflow.entries()]
        .sort((left, right) => right[1].minutes - left[1].minutes)
        .map(([name, entry]) => [name, entry.runs, entry.minutes]);

    const jobRows = [...byJob.entries()]
        .sort((left, right) => right[1].minutes - left[1].minutes)
        .slice(0, 12)
        .map(([name, entry]) => [name, entry.runs, entry.minutes]);

    const dayRows = [...byDay.entries()]
        .sort((left, right) => (left[0] < right[0] ? 1 : -1))
        .map(([day, minutes]) => [day, minutes]);

    console.log(`\n${repo} — billable Actions minutes since ${since}`);
    console.log(`active days: ${days}   billable runs: ${runCount}\n`);
    console.log(formatTable([...workflowRows, ['total', runCount, total]], ['workflow', 'runs', 'minutes']));

    const share = ((total / FREE_TIER_MINUTES) * 100).toFixed(1);
    const remaining = FREE_TIER_MINUTES - total;
    const verdict = remaining >= 0 ? `${remaining} min left` : `${Math.abs(remaining)} min over`;
    console.log(`\nfree tier: ${FREE_TIER_MINUTES} min/month → ${share}% in this window (${verdict})`);
    console.log(`pace: ${(total / days).toFixed(0)} min per active day\n`);

    console.log('top jobs');
    console.log(formatTable(jobRows, ['job', 'runs', 'minutes']));

    console.log('\nby day');
    console.log(formatTable(dayRows, ['day', 'minutes']));

    if (client.rateLimitRemaining < 200) {
        console.log(`\nnote: GitHub API rate limit nearly exhausted (${client.rateLimitRemaining} left)`);
    }
}

await main();
