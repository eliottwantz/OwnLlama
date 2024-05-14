import { getContext, setContext } from 'svelte';

class ModelsStore {
	models = $state<string[]>([]);
	selectedModel = $state<string>('');
	isPreloading = $state(false);

	constructor() {}
}

export const createModelStore = () => {
	const modelStore = new ModelsStore();
	setContext('modelStore', modelStore);
	return modelStore;
};

export const useModelStore = () => {
	const store = getContext<ModelsStore | undefined>('modelStore');
	if (!store) {
		throw new Error('createModelStore() was not called first');
	}

	return store;
};
