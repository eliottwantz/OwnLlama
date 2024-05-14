<script lang="ts">
	import Chat from '$lib/components/Chat/Chat.svelte';
	import ModelsDropdown from '$lib/components/ModelsDropdown/ModelsDropdown.svelte';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
</script>

<main
	class="mx-auto flex h-full max-h-svh min-h-svh flex-col gap-3 p-2 sm:max-w-screen-md xl:max-w-screen-lg 2xl:max-w-screen-xl"
>
	<div class="sticky top-0 z-10 flex items-center justify-between">
		<ModelsDropdown />
		<ThemeSwitcher />
	</div>

	<Chat />
</main>
