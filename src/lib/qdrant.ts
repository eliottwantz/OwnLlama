import { OLLAMA_URL } from '$lib/ollama';
import { QdrantVectorStore } from '@langchain/qdrant';
import { QdrantClient } from '@qdrant/js-client-rest';
import { OllamaEmbeddings } from 'langchain/embeddings/ollama';

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

export const createQdrantRetriever = async (model: string = 'nomic-embed-text') => {
	const store = await QdrantVectorStore.fromExistingCollection(
		new OllamaEmbeddings({ model, baseUrl: OLLAMA_URL }),
		{
			url: QDRANT_URL,
			collectionName: EMBEDDINGS_COLLECTION_NAME
		}
	);

	return store.asRetriever();
};

export const getPoint = async (id: string) => {
	const qdrant = createQdrantClient();
	const document = await qdrant.api('points').getPoint({
		collection_name: EMBEDDINGS_COLLECTION_NAME,
		id
	});

	return document.data.result;
};
