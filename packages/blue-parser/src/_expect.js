export const { expect } = require('chai');

export const expectFailure = (parser, input, errorMessage) => {
    const output = parser.run(input);
    if (!output.isError) {
        console.error(input, output);
    }
    expect(output.isError).toBe(true);
    errorMessage && expect(output.error).toBe(errorMessage);
};

export const expectSuccess = (parser, input, expectation) => {
    const output = parser.run(input);
    if (output.isError) {
        console.error(input, expectation, output);
    }
    expect(output.isError).toBe(false);
    expect(output.result).toEqual(expectation);
};

export const expectThrownError = (parserRun, errorMessage) => {
    expect(parserRun).toThrow(errorMessage);
};
