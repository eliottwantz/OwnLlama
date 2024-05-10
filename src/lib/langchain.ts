import type { Document } from '$lib/document';
import { OLLAMA_URL } from '$lib/ollama';
import { EMBEDDINGS_COLLECTION_NAME, QDRANT_URL } from '$lib/qdrant';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { QdrantVectorStore } from '@langchain/qdrant';

export const insertDocuments = async (
	documents: Document[],
	model: string = 'nomic-embed-text'
) => {
	const store = await QdrantVectorStore.fromTexts(
		documents.map((d) => d.content),
		documents.map((d) => ({ id: crypto.randomUUID(), metadata: d.metadata })),
		new OllamaEmbeddings({ model, baseUrl: OLLAMA_URL }),
		{
			url: QDRANT_URL,
			collectionName: EMBEDDINGS_COLLECTION_NAME
		}
	);

	return store;
};

export const generateEmbeddings = async (documents: Document[]) => {
	const embeddings = new OllamaEmbeddings({
		model: 'nomic-embed-text',
		baseUrl: OLLAMA_URL
	});
	const documentEmbeddings = await embeddings.embedDocuments(documents.map((d) => d.content));
	return documentEmbeddings;
};
