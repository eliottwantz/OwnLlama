import { embedDocuments } from '$lib/ollama';
import type { Document, DocumentWithEmbedding } from './document';
import { qdrant } from './qdrant';

export const COLLECTION_NAME = 'knwoledge_base';

const createEmbeddings = async (documents: Document[]): Promise<DocumentWithEmbedding[] | null> => {
	const docsWithEmbeddings: DocumentWithEmbedding[] = [];

	const embeddings = await embedDocuments(documents);
	if (!embeddings) {
		console.log('Failed to embed documents');
		return null;
	}

	for (const embedding of embeddings) {
		const idx = embeddings.indexOf(embedding);
		docsWithEmbeddings.push({ id: crypto.randomUUID(), embedding, ...documents[idx] });
	}

	return docsWithEmbeddings;
};

export const insertDocuments = async (documents: Document[]) => {
	const docsWithEmbeddings = await createEmbeddings(documents).catch((e) => {
		console.log('Error creating embeddings:\n', e);
		return null;
	});

	if (!docsWithEmbeddings) return null;

	const upsertResult = await qdrant
		.upsert(COLLECTION_NAME, {
			points: docsWithEmbeddings.map((d) => {
				return {
					id: d.id,
					vector: d.embedding,
					payload: {
						document: d.content,
						metadata: d.metadata
					}
				};
			})
		})
		.catch((e) => {
			console.log('Error upserting document:\n', e);
			return null;
		});

	return {
		upsertResult,
		docs: docsWithEmbeddings
	};
};
