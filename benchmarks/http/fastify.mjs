import Fastify from 'fastify';

const port = Number(process.env.PORT ?? 4310);
const app = Fastify({ logger: false });

app.get('/json', async () => ({ message: 'hello' }));
app.get('/users/:id', async (request) => ({ id: request.params.id }));
app.post('/echo', async (request) => request.body);
app.setNotFoundHandler((_request, reply) => reply.code(404).send({ error: 'not found' }));

await app.listen({ port, host: '127.0.0.1' });
console.log(`fastify listening on ${port}`);
