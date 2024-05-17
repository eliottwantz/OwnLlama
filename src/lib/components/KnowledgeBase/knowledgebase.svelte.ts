import type { DocumentMetadata } from '$lib/langchain';
import { getContext, setContext } from 'svelte';

export type QdrantPoint = {
	id: string;
	payload: {
		content: string;
		metadata: DocumentMetadata;
	};
};
class KnowledgeBaseStore {
	documents = $state<QdrantPoint[]>([]);
	selectedDocument = $state<QdrantPoint | null>(null);
	isLoading = $state(false);

	constructor() {}
}

export const createKnowledgeBaseStore = () => {
	const knowledgeBaseStore = new KnowledgeBaseStore();
	setContext('knowledgeBaseStore', knowledgeBaseStore);
	return knowledgeBaseStore;
};

export const useKnowledgeBaseStore = () => {
	const store = getContext<KnowledgeBaseStore | undefined>('knowledgeBaseStore');
	if (!store) {
		throw new Error('createKnowledgeBaseStore() was not called first');
	}

	return store;
};
