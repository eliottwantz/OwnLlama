import { DocumentSchema } from '$lib/document';
import {
	chatLLM,
	insertDocuments,
	insertPDF,
	promptLLM,
	promptLLMWithDocument,
	promptLLMWithKnowledgeBase
} from '$lib/langchain';
import { listModels, preloadModel } from '$lib/ollama';
import {
	EMBEDDINGS_COLLECTION_NAME,
	createQdrantClient,
	ensureCollection,
	getPoint
} from '$lib/qdrant';
import cors from '@elysiajs/cors';
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
				return new Response(await chatLLM(body.prompt, body.model), {
					headers: { 'content-type': 'text/event-stream' }
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
	.group('/documents', (app) => {
		return app
			.get('/', async ({ error }) => {
				const client = createQdrantClient();
				try {
					const documents = await client.getCollection(EMBEDDINGS_COLLECTION_NAME);
					return documents;
				} catch (e) {
					console.log('Failed to get documents:\n', e);
					if (e instanceof Error) return error(500, `Failed to get documents: ${e.message}`);
					return error(500, 'Failed to get documents');
				}
			})
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
				'/:id/prompt',
				async ({ body, error, params }) => {
					const { id } = params;
					console.log('Question from user:', body.prompt);
					try {
						const res = await promptLLMWithDocument(body.prompt, id);
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
				'/',
				async ({ set, body, error }) => {
					try {
						const docs = await insertPDF(body.file);
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
