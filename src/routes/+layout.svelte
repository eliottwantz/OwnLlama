<script>
	import '../app.css';

	import { createClient } from '$lib/api/client';
	import { ModeWatcher } from 'mode-watcher';
	import { browser } from '$app/environment';

	let { children } = $props();

	if (browser) createClient(fetch);
</script>

<svelte:head>
	<title>OwnLlama</title>
</svelte:head>

<ModeWatcher />
{@render children()}
