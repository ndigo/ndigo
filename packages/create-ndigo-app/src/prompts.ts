/**
 * Minimal interactive prompts (readline-based, zero dependencies).
 */
import { createInterface } from 'node:readline';

/**
 * Reads a single line from stdin with an optional default.
 *
 * @param question - The prompt shown to the user.
 * @param defaultValue - Value returned when the answer is blank.
 * @returns The trimmed answer, or `defaultValue` when blank.
 */
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

/**
 * Prompts for a choice from a fixed list, returning the default on empty input.
 *
 * @param question - The prompt shown to the user.
 * @param choices - The allowed answers.
 * @param defaultValue - Value returned when the answer is blank.
 * @returns The selected choice.
 * @throws When the answer is not one of `choices`.
 */
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
