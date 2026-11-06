/**
 * Minimal interactive prompts (readline-based, zero dependencies).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { createInterface } from 'node:readline';

/** Reads a single line from stdin with an optional default. */
export async function promptLine(question: string, defaultValue?: string): Promise<string> {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const suffix = defaultValue !== undefined && defaultValue !== '' ? ` [${defaultValue}]` : '';
    const answer = await new Promise<string>((resolve) => {
        rl.question(`${question}${suffix}: `, (value) => resolve(value));
    });
    rl.close();
    const trimmed = answer.trim();
    return trimmed.length > 0 ? trimmed : (defaultValue ?? '');
}

/** Prompts for a choice from a fixed list, returning the default on empty input. */
export async function promptChoice<T extends string>(
    question: string,
    choices: readonly T[],
    defaultValue: T
): Promise<T> {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const hint = choices.map((choice) => (choice === defaultValue ? `${choice}*` : choice)).join(' / ');
    const answer = await new Promise<string>((resolve) => {
        rl.question(`${question} (${hint}): `, (value) => resolve(value));
    });
    rl.close();
    const trimmed = answer.trim();
    if (trimmed.length === 0) return defaultValue;
    if ((choices as readonly string[]).includes(trimmed)) return trimmed as T;
    throw new Error(`Invalid choice: ${trimmed} (expected one of ${choices.join(', ')})`);
}
