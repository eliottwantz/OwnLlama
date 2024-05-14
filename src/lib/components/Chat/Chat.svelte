<script lang="ts">
	import ChatMessage from '$lib/components/Chat/ChatMessage.svelte';
	import { useChatHistory } from '$lib/components/Chat/chat.svelte';
	import { useModelStore } from '$lib/components/ModelsDropdown/models.svelte';
	import { Button } from '$lib/components/ui/button';
	import { ArrowDown, ChevronRight } from 'lucide-svelte';
	import { tick } from 'svelte';
	import type { EventHandler } from 'svelte/elements';

	let prompt = $state('');
	let errorMsg = $state('');
	let loading = $state(false);
	let autoScroll = $state(true);

	let chatHistory = useChatHistory();
	let modelStore = useModelStore();

	let chatMessagesEl = $state<HTMLDivElement>();

	$effect(() => {
		scrollToBottom();
	});

	const handleSubmit: EventHandler<SubmitEvent, HTMLFormElement> = async (e) => {
		e.preventDefault();

		loading = true;

		chatHistory.addQuestion(prompt, modelStore.selectedModel);

		const question = prompt;
		prompt = '';

		await tick();

		scrollToBottom();

		if (!chatHistory.latestChat) return;

		try {
			const response = await fetch('/api/chat', {
				method: 'POST',
				body: JSON.stringify({ prompt: question, model: modelStore.selectedModel }),
				headers: { 'content-type': 'application/json' }
			});
			if (response.ok) {
				const decoder = new TextDecoder();
				// @ts-expect-error
				for await (const chunk of response.body) {
					chatHistory.latestChat.answer += decoder.decode(chunk);
					if (autoScroll) scrollToBottom();
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

	const scrollToBottom = async () => {
		if (chatMessagesEl) {
			await tick();
			chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
		}
	};
</script>

<div class="flex flex-1 flex-col gap-y-2 overflow-hidden">
	<div
		bind:this={chatMessagesEl}
		onscroll={() => {
			if (!chatMessagesEl) return;
			autoScroll =
				chatMessagesEl.scrollHeight - chatMessagesEl.scrollTop <= chatMessagesEl.clientHeight + 5;
		}}
		class="flex-1 overflow-auto"
	>
		{#if chatHistory.messages.length}
			<div id="messages" class="flex flex-col gap-y-10">
				{#each chatHistory.messages as message}
					<ChatMessage {message} />
				{/each}
			</div>
		{/if}
	</div>

	<div class="relative">
		{#if !autoScroll && chatHistory.messages.length > 0}
			<div class="absolute -top-8 flex w-full justify-center">
				<Button
					on:click={() => scrollToBottom()}
					class="h-7 w-7 rounded-full bg-foreground text-background/80"
					variant="outline"
					size="icon"
				>
					<ArrowDown class="h-5 w-5" />
				</Button>
			</div>
		{/if}
		<form onsubmit={handleSubmit} class="flex flex-col">
			<div class="flex items-center border-b border-b-foreground">
				<input
					bind:value={prompt}
					name="prompt"
					class="flex-1 border-none bg-inherit p-2 focus:border-none focus:outline-0 focus:ring-0"
					placeholder="Question to {modelStore.selectedModel}"
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
