import { QdrantClient } from '@qdrant/js-client-rest';

export const EMBEDDINGS_COLLECTION_NAME = 'knwoledge_base';
export const QDRANT_URL = process.env.QDRANT_URL ?? 'http://127.0.0.1:6333';

export const createQdrantClient = () => {
	const client = new QdrantClient({
		url: QDRANT_URL
	});
	return client;
};

export const ensureCollection = async () => {
	const client = createQdrantClient();

	const exists = await client.collectionExists(EMBEDDINGS_COLLECTION_NAME);
	if (exists) return;

	console.log('Creating collection', EMBEDDINGS_COLLECTION_NAME);
	await client.createCollection(EMBEDDINGS_COLLECTION_NAME, {
		vectors: {
			size: 768,
			distance: 'Cosine'
		}
	});
};
