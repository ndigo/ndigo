/**
 * Entry point: boots the PetClinic server on port 3050 (or `PORT`).
 *
 * The port is defaulted into `process.env` before the context is created: the
 * managed `HTTPServer` reads it at construction time and `NodeAutoConfiguration`
 * builds that bean during refresh.
 *
 * @module blue-petclinic
 * @since 1.0.0
 * @author Jeff Rose
 */
import 'node:process';
import { ApplicationBuilder } from '@blue/boot';
import { HTTP_SERVER, NodeAutoConfiguration, gracefulShutdown } from '@blue/platform-node';
import { getLogger } from '@blue/log';
import { MESSAGE_SOURCE } from './context-tokens';
import { PetClinicConfiguration } from './petclinic-configuration';

// The managed server reads its port from process.env.PORT, so surface the
// app's default there before any context is created.
process.env.PORT ??= '3050';
const PORT = Number(process.env['PORT']);
const logger = getLogger('blue-petclinic');

async function main() {
    // Spring-style bootstrap: register platform auto-configuration plus the
    // app configuration, then run() refreshes the context — handler mappings
    // and dispatcher strategies initialize on refresh.
    const context = await new ApplicationBuilder([NodeAutoConfiguration, PetClinicConfiguration]).run();

    // The application message source backs every template's locale helpers.
    context.setMessageSource(context.getValue(MESSAGE_SOURCE));

    const server = context.getValue(HTTP_SERVER);
    await server.start();
    gracefulShutdown(context, { resources: [server] });

    logger.info(`listening on http://localhost:${PORT}`);
    logger.info(`  GET  /                                          (welcome)`);
    logger.info(`  GET  /owners?lastName=&page=                    (owner search, 5 per page)`);
    logger.info(`  GET  /owners/new                                (create-owner form)`);
    logger.info(`  GET  /owners/:id                                (owner detail)`);
    logger.info(`  GET  /owners/:id/edit                           (update-owner form)`);
    logger.info(`  GET  /owners/:id/pets/new                       (add-pet form)`);
    logger.info(`  GET  /owners/:id/pets/:petId/edit               (update-pet form)`);
    logger.info(`  GET  /owners/:id/pets/:petId/visits/new         (add-visit form)`);
    logger.info(`  GET  /vets?page=                                (vet directory)`);
    logger.info(`  GET  /api/owners  /api/owners/:id  /api/vets    (JSON representations)`);
}

main().catch((error: unknown) => {
    logger.error(`failed to start: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
});
