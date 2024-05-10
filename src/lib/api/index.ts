import { DocumentSchema } from '$lib/document';
import {
	generateEmbeddings,
	insertDocuments,
	promptLLM,
	promptLLMWithDocument,
	promptLLMWithKnowledgeBase
} from '$lib/langchain';
import { listModels } from '$lib/ollama';
import { EMBEDDINGS_COLLECTION_NAME, createQdrantClient, ensureCollection } from '$lib/qdrant';
import cors from '@elysiajs/cors';
import { Elysia, t } from 'elysia';

await ensureCollection();

export const api = new Elysia({ prefix: '/api' })
	.use(cors())
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
		'/prompt-with-document',
		async ({ body, error }) => {
			console.log('Question from user:', body.prompt);
			try {
				const res = await promptLLMWithDocument(body.prompt, body.docId);
				return { answer: res };
			} catch (e) {
				console.log('Failed to prompt LLM:\n', e);
				if (e instanceof Error) return error(500, `Failed to prompt LLM: ${e.message}`);
				return error(500, 'Failed to prompt LLM');
			}
		},
		{
			body: t.Object({
				prompt: t.String(),
				docId: t.String()
			})
		}
	)
	.post(
		'/embed',
		async ({ body, error }) => {
			try {
				const res = await generateEmbeddings([body]);
				return { embeddings: res };
			} catch (e) {
				console.log('Failed to embed document:\n', e);
				if (e instanceof Error) return error(500, `Failed to embed document: ${e.message}`);
				return error(500, 'Failed to embed document');
			}
		},
		{
			body: DocumentSchema
		}
	)
	.get('/documents', async ({ error }) => {
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
	.post(
		'/documents',
		async ({ set, body, error }) => {
			try {
				await insertDocuments([body]);
				console.log(`Inserted document`);
				set.status = 201;
				return { msg: 'Successfully uploaded documents' };
			} catch (e) {
				console.log('Failed to insert document');
				if (e instanceof Error) return error(500, `Failed to insert document: ${e.message}`);
				return error(500, 'Failed to insert document');
			}
		},
		{
			body: DocumentSchema
		}
	)
	.post(
		'/documents/bulk',
		async ({ set, body, error }) => {
			try {
				const store = await insertDocuments(body.documents);
				console.log(`Inserted documents:\n`, store.toJSON());
				set.status = 201;
				return { msg: 'Successfully uploaded documents' };
			} catch (e) {
				console.log('Failed to insert document');
				if (e instanceof Error) return error(500, `Failed to insert document: ${e.message}`);
				return error(500, 'Failed to insert document');
			}
		},
		{
			body: t.Object({
				documents: t.Array(DocumentSchema)
			})
		}
	);

export type API = typeof api;
