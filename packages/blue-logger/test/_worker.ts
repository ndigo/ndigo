import { http, HttpResponse, delay } from 'msw';
import { setupServer } from 'msw/node';

const handlers = [
    http.post('http://localhost/log/:duration', async ({ params }) => {
        const duration = Number(params.duration);
        await delay(duration);
        return HttpResponse.text('OK');
    }),
];

export const server = setupServer(...handlers);
