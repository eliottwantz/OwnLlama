import { ChatOllama } from '@langchain/community/chat_models/ollama';
import { Ollama } from 'ollama';

export const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://127.0.0.1:11434';

export const listModels = async () => {
	const client = new Ollama({ host: OLLAMA_URL });
	const res = await client
		.list()
		.then((res) => res.models)
		.catch((e) => {
			console.log('Error listing models:\n', e);
			return null;
		});
	return res;
};

export const createOllamaLLM = (model: string = 'llama3') => {
	return new ChatOllama({ model, baseUrl: OLLAMA_URL });
};
