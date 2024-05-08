import type { Document, DocumentWithEmbedding } from './document';
import { embed } from './ollama';
import { qdrant } from './qdrant';

export const COLLECTION_NAME = 'knwoledge_base';

const createEmbeddings = async (documents: Document[]): Promise<DocumentWithEmbedding[]> => {
	const docsWithEmbeddings: DocumentWithEmbedding[] = [];

	for (const document of documents) {
		const embedding = await embed(document);
		if (embedding === null) {
			console.log('Failed to embed document starting with:', document.content.slice(0, 30));
			continue;
		}
		docsWithEmbeddings.push({ ...document, embedding, id: crypto.randomUUID() });
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
