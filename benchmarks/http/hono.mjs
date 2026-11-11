import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const port = Number(process.env.PORT ?? 4312);
const app = new Hono();

app.get('/json', (context) => context.json({ message: 'hello' }));
app.get('/users/:id', (context) => context.json({ id: context.req.param('id') }));
app.post('/echo', async (context) => context.json(await context.req.json()));
app.notFound((context) => context.json({ error: 'not found' }, 404));

serve({ fetch: app.fetch, port, hostname: '127.0.0.1' }, () => console.log(`hono listening on ${port}`));
