import ollama from 'ollama';
import { type Document } from './document';

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
