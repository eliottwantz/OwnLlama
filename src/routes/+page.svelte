<script lang="ts">
	import Chat from '$lib/components/Chat/Chat.svelte';
	import KnowledgeBase from '$lib/components/KnowledgeBase/KnowledgeBase.svelte';
	import { createKnowledgeBaseStore } from '$lib/components/KnowledgeBase/knowledgebase.svelte';
	import ModelsDropdown from '$lib/components/ModelsDropdown/ModelsDropdown.svelte';
	import { createModelStore } from '$lib/components/ModelsDropdown/models.svelte';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';

	createModelStore();
	createKnowledgeBaseStore();
</script>

<main
	class="mx-auto flex h-full max-h-dvh min-h-dvh flex-col gap-3 p-2 sm:max-w-screen-md xl:max-w-screen-lg 2xl:max-w-screen-xl"
>
	<div class="sticky top-0 z-10 flex items-center justify-between">
		<div class="flex gap-x-4">
			<ModelsDropdown />
			<KnowledgeBase />
		</div>
		<ThemeSwitcher />
	</div>

	<Chat />
</main>
