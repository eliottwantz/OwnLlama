<script>
	import ModelsDropdown from '$lib/components/ModelsDropdown.svelte';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';

	let { children } = $props();
</script>

<svelte:head>
	<title>OwnLlama</title>
</svelte:head>

<ModeWatcher />

<div class="min-h-svh p-1">
	<div class="mb-2 flex items-center justify-between">
		<ModelsDropdown />
		<ThemeSwitcher />
	</div>
	<div class="mx-auto max-w-screen-lg">
		{@render children()}
	</div>
</div>
