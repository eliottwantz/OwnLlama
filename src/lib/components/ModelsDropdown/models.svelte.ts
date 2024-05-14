class ModelsStore {
	models = $state<string[]>([]);

	constructor() {}
}

export const useModelStore = () => new ModelsStore();
