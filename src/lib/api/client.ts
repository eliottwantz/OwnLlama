import type { API } from '$lib/api';
import { treaty } from '@elysiajs/eden';

export const useApiClient = (fetcher?: typeof window.fetch) => {
	const client = treaty<API>(`${window.location.origin}`, {
		fetcher
	}).api;

	return client;
};
