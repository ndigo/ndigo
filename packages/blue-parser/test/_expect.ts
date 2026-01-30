import { expect } from 'vitest';

type ParserRunResult<T> =
    | {
          isError: true;
          error: string;
      }
    | {
          isError: false;
          result: T;
      };

type Parser<T> = {
    run(input: string): ParserRunResult<T>;
};

export const expectFailure = <T>(parser: Parser<T>, input: string, errorMessage?: string): void => {
    const output = parser.run(input);

    if (!output.isError) {
        console.error(input, output);
    }

    expect(output.isError).toBe(true);

    if (errorMessage) {
        expect((output as Extract<ParserRunResult<T>, { isError: true }>).error).toBe(errorMessage);
    }
};

export const expectSuccess = <T>(parser: Parser<T>, input: string, expectation: T): void => {
    const output = parser.run(input);

    if (output.isError) {
        console.error(input, expectation, output);
    }

    expect(output.isError).toBe(false);
    expect((output as Extract<ParserRunResult<T>, { isError: false }>).result).toEqual(expectation);
};

export const expectThrownError = (fn: () => unknown, errorMessage?: string): void => {
    if (typeof errorMessage === 'string') {
        expect(fn).toThrow(errorMessage);
        return;
    }
    expect(fn).toThrow();
};
