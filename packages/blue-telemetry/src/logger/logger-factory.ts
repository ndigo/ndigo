import { Logger } from './logger';
import { OpenTelemetryLogger } from './open-telemetry-logger';
import { ConsoleLogger } from './console-logger';
import { SeverityNumber } from '@opentelemetry/api-logs';
import { ContextAwareLogger } from './context-aware-logger';

export type LoggerType = 'open-telemetry' | 'console' | 'none';

class NoopLogger implements Logger {
    #threshold: SeverityNumber = SeverityNumber.FATAL4;

    get threshold(): SeverityNumber {
        return this.#threshold;
    }

    setThreshold(threshold: SeverityNumber): void {
        this.#threshold = threshold;
    }

    isEnabled(severityNumber: SeverityNumber): boolean {
        return severityNumber >= this.#threshold;
    }

    debug(): void {}

    info(): void {}

    warn(): void {}

    error(): void {}
}

export class LoggerFactory {
    private static type: LoggerType = 'console';
    private static threshold: SeverityNumber = SeverityNumber.DEBUG;
    private static contextAware: boolean = true;

    public static setType(type: LoggerType): void {
        this.type = type;
    }

    public static setThreshold(threshold: SeverityNumber): void {
        this.threshold = threshold;
    }

    public static setContextAware(enabled: boolean): void {
        this.contextAware = enabled;
    }

    public static reset(): void {
        this.type = 'console';
        this.threshold = SeverityNumber.DEBUG;
        this.contextAware = true;
    }

    public static getLogger(name: string): Logger {
        let logger: Logger;

        if (this.type === 'open-telemetry') {
            logger = new OpenTelemetryLogger(name, this.threshold);
        } else if (this.type === 'console') {
            logger = new ConsoleLogger(name, this.threshold);
        } else {
            logger = new NoopLogger();
        }

        if (this.contextAware && this.type !== 'none') {
            return new ContextAwareLogger(logger);
        }

        return logger;
    }
}

export function getLogger(name: string): Logger {
    return LoggerFactory.getLogger(name);
}
