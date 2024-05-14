<script lang="ts">
	import Chat from '$lib/components/Chat.svelte';
	import ModelsDropdown from '$lib/components/ModelsDropdown.svelte';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import { Button } from '$lib/components/ui/button';
	import { ChevronRight } from 'lucide-svelte';
	import type { EventHandler } from 'svelte/elements';

	let prompt = $state('');
	let errorMsg = $state('');
	let loading = $state(false);
	let llmResponse = $state('');

	const handleSubmit: EventHandler<SubmitEvent, HTMLFormElement> = async (e) => {
		e.preventDefault();

		loading = true;

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				body: JSON.stringify({ prompt }),
				headers: { 'content-type': 'application/json' }
			});
			if (response.ok) {
				const decoder = new TextDecoder();
				// @ts-expect-error
				for await (const chunk of response.body) {
					llmResponse += decoder.decode(chunk);
				}
			}
		} catch (error) {
			console.log('Error prompting LLM:\n', error);
			if (error instanceof Error) {
				errorMsg = error.message;
				setTimeout(() => (errorMsg = ''), 3000);
				return;
			}
		} finally {
			loading = false;
		}

		prompt = '';
	};
</script>

<main
	class="mx-auto flex h-full max-h-svh min-h-svh flex-col gap-3 p-2 sm:max-w-screen-md xl:max-w-screen-lg 2xl:max-w-screen-xl"
>
	<div class="sticky top-0 z-10 flex items-center justify-between">
		<ModelsDropdown />
		<ThemeSwitcher />
	</div>

	<div class="flex flex-1 flex-col gap-y-2 overflow-hidden">
		<div class="flex-1 overflow-auto text-xl">
			<Chat content={llmResponse} />
		</div>

		<form onsubmit={handleSubmit} class="flex flex-col">
			<div class="flex items-center border-b border-b-foreground">
				<input
					bind:value={prompt}
					name="prompt"
					class="flex-1 border-none bg-inherit p-2 focus:border-none focus:outline-0 focus:ring-0"
					placeholder="Question"
					autocomplete="off"
				/>

				<Button
					disabled={loading || !prompt.length}
					size="icon"
					class="h-7 w-7 rounded-full disabled:bg-neutral-600"
				>
					<ChevronRight class="h-4 w-4" />
				</Button>
			</div>
		</form>
	</div>
</main>
