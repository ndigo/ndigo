const { rest, setupWorker } = require('msw');

const handlers = [
    rest.post('/log/:duration', ({ params }, response, context) => {
        const { duration } = params;
        return response(context.delay(Number(duration)), context.body('OK'));
    }),
];

export const worker = setupWorker(...handlers);
