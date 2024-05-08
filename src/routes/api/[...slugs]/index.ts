import { DocumentSchema } from '$lib/document';
import { ensureCollection, qdrant } from '$lib/qdrant';
import { COLLECTION_NAME, insertDocuments } from '$lib/rag';
import { Elysia, t } from 'elysia';

await ensureCollection(COLLECTION_NAME);

export const api = new Elysia({ prefix: '/api' })
	.get('/', () => 'rad-qdrant 🔥😁👍')
	.get('/documents', async () => {
		const documents = await qdrant.getCollection(COLLECTION_NAME);
		return documents;
	})
	.post(
		'/documents',
		async ({ set, body }) => {
			const res = await insertDocuments(body.documents);
			if (!res) {
				console.log('Failed to insert documents');
				set.status = 500;
				return;
			}

			console.log('Inserted documents:\n', res);
			set.status = 201;
		},
		{
			body: t.Object({
				documents: t.Array(DocumentSchema)
			})
		}
	);

export type API = typeof api;
