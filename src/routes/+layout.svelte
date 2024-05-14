<script>
	import ModelsDropdown from '$lib/components/ModelsDropdown.svelte';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { ChevronRight } from 'lucide-svelte';
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';

	let { children } = $props();
</script>

<svelte:head>
	<title>OwnLlama</title>
</svelte:head>

<ModeWatcher />
{@render children()}
