import express from 'express';

const port = Number(process.env.PORT ?? 4311);
const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/json', (_request, response) => response.json({ message: 'hello' }));
app.get('/users/:id', (request, response) => response.json({ id: request.params.id }));
app.post('/echo', (request, response) => response.json(request.body));
app.use((_request, response) => response.status(404).json({ error: 'not found' }));

app.listen(port, '127.0.0.1', () => console.log(`express listening on ${port}`));
