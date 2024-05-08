import type { API } from '$lib/api';
import { treaty } from '@elysiajs/eden';

export const createClient = (fetcher: typeof window.fetch) => {
	const client = treaty<API>('http://localhost:5173', {
		fetcher
	}).api;

	return client;
};
export const client = createClient(fetch);
