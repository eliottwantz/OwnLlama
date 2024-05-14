<script lang="ts">
	import ChatMessage from '$lib/components/Chat/ChatMessage.svelte';
	import { useChatHistory } from '$lib/components/Chat/chat.svelte';
	import { Button } from '$lib/components/ui/button';
	import { ChevronRight } from 'lucide-svelte';
	import type { EventHandler } from 'svelte/elements';

	let prompt = $state('');
	let errorMsg = $state('');
	let loading = $state(false);
	let chatHistory = useChatHistory();

	const handleSubmit: EventHandler<SubmitEvent, HTMLFormElement> = async (e) => {
		e.preventDefault();

		if (!chatHistory.latestChat) return;

		loading = true;

		chatHistory.addQuestion(prompt);

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
					chatHistory.latestChat.answer += decoder.decode(chunk);
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

<div class="flex flex-1 flex-col gap-y-2 overflow-hidden">
	<div class="flex-1 overflow-auto">
		{#if chatHistory.messages.length}
			<div class="flex flex-col gap-y-10">
				{#each chatHistory.messages as message}
					<ChatMessage {message} />
				{/each}
			</div>
		{/if}
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
