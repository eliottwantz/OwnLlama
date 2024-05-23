import {
	chatLLM,
	chatLLMUsingDocument,
	insertPDF,
	promptLLM,
	promptLLMWithKnowledgeBase,
	type ChatResponse
} from '$lib/langchain';
import { listModels, preloadModel } from '$lib/ollama';
import { ensureCollection, getPoint, listDocuments } from '$lib/qdrant';
import cors from '@elysiajs/cors';
import { Stream } from '@elysiajs/stream';
import swagger from '@elysiajs/swagger';
import { Elysia, t } from 'elysia';

await ensureCollection();

export const api = new Elysia({ prefix: '/api' })
	.use(cors())
	.use(swagger())
	.get('/', () => 'rad-qdrant 🔥😁👍')
	.get('/models', async () => {
		const models = await listModels();
		if (!models) {
			return {
				error: 'No local ollama models installed. Go to https://ollama.com/library to install one.'
			};
		}
		return { models: models.map((m) => m.name) };
	})
	.get('/ollama/preload/:model', async ({ params, error }) => {
		const { model } = params;
		try {
			console.log('Preloading model:', model);
			await preloadModel(model);
			console.log('Preloaded model:', model);
		} catch (e) {
			if (e instanceof Error) {
				console.log('Failed to preload model:\n', e);
				return error(500, `Failed to preload model: ${e.message}`);
			}
			console.log('Failed to preload model with unknown error:\n', e);
			return error(500, 'Failed to preload model');
		}
	})
	.post(
		'/prompt',
		async ({ body, error }) => {
			console.log('Question from user:', body.prompt);
			try {
				const res = await promptLLM(body.prompt);
				return { answer: res };
			} catch (e) {
				console.log('Failed to prompt LLM:\n', e);
				if (e instanceof Error) return error(500, `Failed to prompt LLM: ${e.message}`);
				return error(500, 'Failed to prompt LLM');
			}
		},
		{
			body: t.Object({
				prompt: t.String()
			})
		}
	)
	.post(
		'/prompt-with-knowledge',
		async ({ body, error }) => {
			console.log('Question from user:', body.prompt);
			try {
				const res = await promptLLMWithKnowledgeBase(body.prompt);
				return { answer: res };
			} catch (e) {
				console.log('Failed to prompt LLM:\n', e);
				if (e instanceof Error) return error(500, `Failed to prompt LLM: ${e.message}`);
				return error(500, 'Failed to prompt LLM');
			}
		},
		{
			body: t.Object({
				prompt: t.String()
			})
		}
	)
	.post(
		'/chat',
		async ({ body, error }) => {
			console.log('Question to', body.model, ' from user:', body.prompt);
			try {
				const res = await chatLLM(body.prompt, body.model);
				return new Stream(async (stream) => {
					for await (const content of res) {
						stream.send({ content });
					}

					stream.close();
					console.log('Chat stream closed');
				});

				// for await (const chunk of res) {
				// 	console.log(chunk);
				// }
				// console.log('Chat stream closed');
				// return 'OK';
			} catch (e) {
				console.log('Failed to prompt LLM:\n', e);
				if (e instanceof Error) return error(500, `Failed to prompt LLM: ${e.message}`);
				return error(500, 'Failed to prompt LLM');
			}
		},
		{
			body: t.Object({
				prompt: t.String(),
				model: t.Optional(t.String())
			})
		}
	)
	.group('/documents', (app) => {
		return app
			.get(
				'/',
				async ({ error }) => {
					try {
						const documents = await listDocuments();
						if (!documents) {
							return error(500, { message: 'Failed to get documents' });
						}
						if (!documents.length) {
							return error(404, { message: 'No documents found' });
						}
						return { documents };
					} catch (e) {
						console.log('Failed to get documents:\n', e);
						if (e instanceof Error)
							return error(500, { message: `Failed to get documents: ${e.message}` });
						return error(500, { message: 'Failed to get documents' });
					}
				},
				{
					detail: {
						description: 'List all documents'
					}
				}
			)
			.get('/:id', async ({ params, error }) => {
				const { id } = params;

				try {
					const res = await getPoint(id).then((d) => d?.payload?.content as string | undefined);
					if (!res) {
						return error(404, 'Document not found');
					}
					return { answer: res };
				} catch (e) {
					console.log('Failed to prompt LLM:\n', e);
					if (e instanceof Error) return error(500, `Failed to prompt LLM: ${e.message}`);
					return error(500, 'Failed to prompt LLM');
				}
			})
			.post(
				'/:id/chat',
				async ({ body, error, params }) => {
					const { id } = params;
					console.log('Question to', body.model, ' from user:', body.prompt);
					try {
						const res = await chatLLMUsingDocument(body.prompt, id, body.model);
						return new Stream(async (stream) => {
							for await (const content of res) {
								stream.send({ content });
							}

							stream.close();
							console.log('Chat stream closed');
						});
					} catch (e) {
						console.log('Failed to prompt LLM:\n', e);
						if (e instanceof Error) return error(500, `Failed to prompt LLM: ${e.message}`);
						return error(500, 'Failed to prompt LLM');
					}
				},
				{
					body: t.Object({
						prompt: t.String(),
						model: t.Optional(t.String())
					})
				}
			)
			.post(
				'/',
				async ({ set, body, error }) => {
					try {
						const docs = await insertPDF(body.file, body.file.name);
						set.status = 201;
						return { msg: 'Successfully uploaded document', docs };
					} catch (e) {
						console.log('Failed to insert document');
						if (e instanceof Error) return error(500, `Failed to insert document: ${e.message}`);
						return error(500, 'Failed to insert document');
					}
				},
				{
					body: t.Object({
						file: t.File()
					})
				}
			);
	});

export type API = typeof api;
