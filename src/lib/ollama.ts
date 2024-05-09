import ollama from 'ollama';
import { type Document } from './document';
import { getPoint, qdrant } from '$lib/qdrant';
import { COLLECTION_NAME } from '$lib/rag';

export const listModels = async () => {
	const res = await ollama
		.list()
		.then((res) => res.models)
		.catch((e) => {
			console.log('Error listing models:\n', e);
			return null;
		});
	return res;
};

export const embed = async (
	document: Document,
	model: string = 'nomic-embed-text'
): Promise<number[] | null> => {
	const res = await ollama
		.embeddings({
			model: 'nomic-embed-text',
			prompt: document.content
		})
		.then((res) => res.embedding)
		.catch(() => null);

	return res;
};

export const promptLLM = async (prompt: string, model: string = 'llama3') => {
	const res = await ollama
		.generate({
			model,
			prompt
		})
		.then((res) => res)
		.catch((e) => e as Error);

	return res;
};

export const promptLLMWithKnowledge = async (
	prompt: string,
	docId: string,
	model: string = 'llama3'
) => {
	const document = await getPoint(docId).catch((e) => {
		console.log('Error getting document:\n', e);
		return e as Error;
	});

	if (document instanceof Error) return document;

	const res = await ollama
		.generate({
			model,
			prompt
			// context: document.data.result?.vector?.at(0) ?? undefined
		})
		.then((res) => res)
		.catch((e) => e as Error);

	return res;
};
