<script>
	import { ModeWatcher } from 'mode-watcher';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>OwnLlama</title>
</svelte:head>

<ModeWatcher />
{@render children()}
