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
		} finally {
			loading = false;
		}

		// if (error) {
		// 	errorMsg = error.value;
		// 	setTimeout(() => (errorMsg = ''), 3000);
		// 	return;
		// }

		// console.log('data:\n', data);

		prompt = '';
	};
</script>

<!-- <main class="flex h-full w-full max-w-full flex-1 flex-col overflow-auto p-1 text-sm">
	<div role="presentation" class="flex h-full flex-col focus-visible:outline-0">
		<div class="flex-1 overflow-hidden">
			<div class="flex flex-col text-sm">
				<div class="sticky top-0 z-10 mb-2 flex h-10 items-center justify-between">
					<ModelsDropdown />
					<ThemeSwitcher />
				</div>
				{#if errorMsg}
					<p class="mb-2 text-lg text-red-500">{errorMsg}</p>
				{/if}
				{#if llmResponse}
					<div class="mb-2 text-lg">
						<Chat content={llmResponse} />
					</div>
				{/if}
				<div class="mb-2 text-lg">
					<Chat content={llmResponse} />
				</div>
			</div>
		</div>
		<div
			class="w-full dark:border-white/20 md:w-[calc(100%-.5rem)] md:border-transparent md:pt-0 md:dark:border-transparent"
		>
			<div class="mx-auto max-w-screen-lg px-2.5">
				<form onsubmit={handleSubmit} class="flex flex-col gap-4">
					<div class="flex items-center border-b border-b-white">
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
		</div>
	</div>
</main> -->

<main class="flex h-full max-h-svh min-h-svh flex-col bg-yellow-800 p-2">
	<div class="sticky top-0 z-10 flex items-center justify-between">
		<h1>Hi</h1>
		<ModelsDropdown />
		<ThemeSwitcher />
	</div>

	<div class="flex flex-1 flex-col overflow-hidden">
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
