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

export const promptLLM = async (prompt: string, model: string = 'llama3') => {
	const client = new Ollama({ model });
	return await client.invoke(prompt);
};
