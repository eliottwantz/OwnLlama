// import { Elysia } from 'elysia';

import { run } from "./src/rag";

// const app = new Elysia().get('/', () => ({ hello: 'Bun👋' })).listen(8080);

// console.log(`Listening on ${app.server!.url}`);

await run();
