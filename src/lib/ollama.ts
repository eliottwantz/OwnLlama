import type { Document } from '$lib/document';
import { getPoint } from '$lib/qdrant';
import { OllamaEmbeddings } from '@langchain/community/embeddings/ollama';
import { Ollama } from '@langchain/community/llms/ollama';
import ollama from 'ollama';

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

export const embedDocuments = async (documents: Document[], model: string = 'nomic-embed-text') => {
	const embeddings = new OllamaEmbeddings({
		model
	});

	const res = await embeddings
		.embedDocuments(documents.map((d) => d.content))
		.then((res) => res)
		.catch((e) => {
			console.log('Error embedding documents:\n', e);
			return null;
		});

	return res;
};

export const promptLLM = async (prompt: string, model: string = 'llama3') => {
	const client = new Ollama({ model });
	const res = await client
		.generate([prompt])
		.then((res) => {
			console.log('Gen output:\n', res);
			return res;
		})
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

	if (document instanceof Error) {
		return {
			success: false,
			error: document
		} as const;
	}

	const res = await ollama
		.generate({
			model,
			prompt
		})
		.then(
			(res) =>
				({
					success: true,
					res
				}) as const
		)
		.catch((e) => {
			console.log('Error generating response:\n', e);
			return {
				success: false,
				error: e as Error
			} as const;
		});

	return res;
};
