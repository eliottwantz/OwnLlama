import { getContext, setContext } from 'svelte';

class ModelsStore {
	models = $state<string[]>([]);
	selectedModel = $state<string>('');
	id = crypto.randomUUID();

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
