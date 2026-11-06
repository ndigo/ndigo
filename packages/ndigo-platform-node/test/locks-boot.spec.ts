/**
 * Locks stack through the real `NodeAutoConfiguration` (AD-73): the
 * `lockDriver` bean exists, a `@scheduled({ lock })` task runs through the
 * real registry→scheduler→driver wiring, and its lease is released after
 * the run.
 */
// @vitest-environment node
import { describe, test, expect } from 'vitest';
import { configuration, entry, MetadataConfigApplicationContext } from '@ndigo/context';
import { delay } from '@ndigo/util';
import { InProcessLockDriver, LOCK_DRIVER } from '@ndigo/locks';
import { scheduled } from '@ndigo/scheduler';
import { NodeAutoConfiguration } from '../src/node-auto-configuration';

class ProbeLockedTask {
    runs = 0;

    @scheduled({ fixedRate: 40, lock: 'boot-gate' })
    async lockedTick() {
        this.runs += 1;
    }
}

@configuration
class TaskConfiguration {
    @entry()
    task() {
        return new ProbeLockedTask();
    }
}

async function waitFor(predicate: () => boolean | Promise<boolean>): Promise<void> {
    for (let attempt = 0; attempt < 400; attempt += 1) {
        // oxlint-disable-next-line no-await-in-loop -- deterministic polling: each check must observe the previous state
        if (await predicate()) {
            return;
        }
        // oxlint-disable-next-line no-await-in-loop -- deterministic polling interval
        await delay(5);
    }
    throw new Error('waitFor: condition not reached in time');
}

describe('locks stack through NodeAutoConfiguration', () => {
    test('boots a locked scheduled task through the real beans', async () => {
        const context = new MetadataConfigApplicationContext('locks-app');
        context.register(NodeAutoConfiguration);
        context.register(TaskConfiguration);

        context.refresh();

        const driver = context.getValue(LOCK_DRIVER) as InProcessLockDriver;
        expect(driver.kind).toBe('in-process');

        const task = context.getValue('task') as ProbeLockedTask;
        await waitFor(() => task.runs >= 2);

        // The runner releases the lease after each run (finally): an
        // immediate external acquisition wins with no wait budget.
        const probe = await driver.acquire('boot-gate', { ttlMs: 10_000 });
        if (probe === null) {
            throw new Error('the scheduler did not release the lease after the run');
        }
        await probe.release();

        context.close();
    });
});
