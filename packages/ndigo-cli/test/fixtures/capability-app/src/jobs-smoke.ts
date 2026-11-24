/**
 * The fixture's jobs smoke: boot the assembly with the applied
 * `JobsConfiguration` registered, confirm the template's worker was
 * discovered, round-trip one job through the queue and the explicitly
 * started runner, and close. Run after `ndigo add background-jobs`.
 */
import 'node:process';
import '@tsmetadata/polyfill';
import { appendFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { ApplicationBuilder } from '@ndigo/boot';
import { JOB_HANDLER_REGISTRY, JOB_QUEUE, jobHandler } from '@ndigo/jobs';
import { NodeAutoConfiguration } from '@ndigo/platform-node';
import { configuration, entry } from '@ndigo/context';
import { FixtureConfiguration } from './app-configuration';
import { JobsConfiguration, startJobs } from './jobs';

/** The file the smoke handler writes; its presence proves delivery. */
const OUT = 'jobs-smoke.out';

/**
 * The smoke's own worker: unlike the template's sample, this one leaves an
 * observable trace so the test can prove the runner delivered the job.
 */
class SmokeWorker {
    /**
     * Record the delivery.
     */
    @jobHandler('smoke.ping', { maxAttempts: 1, timeoutMs: 5_000 })
    async ping(): Promise<void> {
        appendFileSync(OUT, 'ok');
    }
}

/**
 * The smoke's wiring.
 */
@configuration
class SmokeConfiguration {
    /**
     * @returns The smoke worker.
     */
    @entry()
    smokeWorker(): SmokeWorker {
        return new SmokeWorker();
    }
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const context = await new ApplicationBuilder([
    NodeAutoConfiguration,
    FixtureConfiguration,
    JobsConfiguration,
    SmokeConfiguration,
]).run();

try {
    // The template's sample worker is discovered by the registry.
    const types = context.getValue(JOB_HANDLER_REGISTRY).handlers.map((handler) => handler.type);
    if (!types.includes('email.send')) {
        throw new Error(`the template's worker was not discovered — registered: ${types.join(', ')}`);
    }

    rmSync(OUT, { force: true });
    await context.getValue(JOB_QUEUE).enqueue({ type: 'smoke.ping', payload: {} });
    startJobs(context);

    // The runner polls on its own interval; wait for the delivery.
    for (let waited = 0; waited < 10_000 && !existsSync(OUT); waited += 250) {
        // oxlint-disable-next-line no-await-in-loop -- polling wait: each sleep must observe the file written by the previous interval.
        await sleep(250);
    }
    if (!existsSync(OUT) || readFileSync(OUT, 'utf8') !== 'ok') {
        throw new Error('the runner did not deliver the job within 10 s');
    }
    process.stdout.write('jobs-smoke: ok\n');
} catch (error) {
    process.stderr.write(`jobs-smoke: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
} finally {
    context.close();
}
