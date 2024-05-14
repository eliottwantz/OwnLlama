import type { API } from '$lib/api';
import { treaty } from '@elysiajs/eden';
import { getContext, setContext } from 'svelte';

export const createClient = (fetcher: typeof window.fetch) => {
	const client = treaty<API>(`${window.location.origin}`, {
		fetcher
	}).api;

	setContext('client', client);

	return client;
};

export const getApiClient = () => {
	return getContext<ReturnType<typeof createClient>>('client');
};
