/**
 * Application configuration: registers the httpbin controllers as beans so the
 * platform handler mapping discovers their routes on refresh.
 */
import '@tsmetadata/polyfill';
import { configuration, entry } from '@ndigo/context';
import { ContentController } from './content-controller';
import { EchoController } from './echo-controller';
import { MatrixController } from './matrix-controller';
import { ResponseController } from './response-controller';

/**
 * Wires the four probe controllers — echo, content, matrix and response — into
 * the application context.
 */
@configuration
export class HTTPBinConfiguration {
    @entry()
    echoController() {
        return new EchoController();
    }

    @entry()
    contentController() {
        return new ContentController();
    }

    @entry()
    matrixController() {
        return new MatrixController();
    }

    @entry()
    responseController() {
        return new ResponseController();
    }
}
