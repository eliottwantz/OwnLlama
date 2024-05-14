import { getContext, setContext } from 'svelte';

class ModelsStore {
	models = $state<string[]>([]);
	selectedModel = $state<string>('');
	id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

	constructor() {}
}

export const createModelStore = () => {
	const modelStore = new ModelsStore();
	setContext('modelStore', modelStore);
	console.log('Created new modelStore with id', modelStore.id);
	return modelStore;
};

export const useModelStore = () => {
	const store = getContext<ModelsStore | undefined>('modelStore');
	if (!store) {
		throw new Error('createModelStore() was not called first');
	}

	return store;
};
