<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { useApiClient } from '$lib/api/client';
	import ChatMessage from '$lib/components/Chat/ChatMessage.svelte';
	import { useChatHistory } from '$lib/components/Chat/chat.svelte';
	import { useKnowledgeBaseStore } from '$lib/components/KnowledgeBase/knowledgebase.svelte';
	import { useModelStore } from '$lib/components/ModelsDropdown/models.svelte';
	import { Button } from '$lib/components/ui/button';
	import { ArrowDown, ChevronRight, FilePlus, LoaderCircle } from 'lucide-svelte';
	import { tick } from 'svelte';
	import type { ChangeEventHandler, EventHandler, KeyboardEventHandler } from 'svelte/elements';

	let prompt = $state('');
	let errorMsg = $state('');
	let loading = $state(false);
	let autoScroll = $state(true);
	let inputFiles = $state<FileList>();

	let chatHistory = useChatHistory();
	let modelStore = useModelStore();
	let knowledgeBaseStore = useKnowledgeBaseStore();

	let chatMessagesEl = $state<HTMLDivElement>();
	let inputEl = $state<HTMLTextAreaElement>();
	let formEl = $state<HTMLFormElement>();
	let filesInputElement = $state<HTMLInputElement>();

	$effect(() => {
		scrollToBottom();
	});

	const handleSubmit: EventHandler<SubmitEvent, HTMLFormElement> = async (e) => {
		e.preventDefault();

		loading = true;

		chatHistory.addQuestion(
			prompt,
			modelStore.selectedModel,
			knowledgeBaseStore.selectedDocument?.id
		);

		const question = prompt;
		prompt = '';

		await tick();

		scrollToBottom();
		handleResize();

		if (!chatHistory.latestChat) return;

		try {
			let response: Response;
			if (knowledgeBaseStore.selectedDocument) {
				response = await fetch(`/api/documents/${knowledgeBaseStore.selectedDocument.id}/chat`, {
					method: 'POST',
					body: JSON.stringify({ prompt: question, model: modelStore.selectedModel }),
					headers: { 'content-type': 'application/json' }
				});
			} else {
				response = await fetch('/api/chat', {
					method: 'POST',
					body: JSON.stringify({ prompt: question, model: modelStore.selectedModel }),
					headers: { 'content-type': 'application/json' }
				});
			}

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
			await tick();
			inputEl?.focus();
		}

		prompt = '';
	};

	const scrollToBottom = async () => {
		if (chatMessagesEl) {
			await tick();
			chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
		}
	};

	const handleResize = () => {
		if (!inputEl) return;
		inputEl.style.height = 'auto';
		inputEl.style.height = `${inputEl.scrollHeight}px`;
	};
	const handleCtrlEnter: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
		if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
			formEl?.requestSubmit();
		}
	};
	const handleFilesChange: ChangeEventHandler<HTMLInputElement> = async () => {
		if (!inputFiles) return;

		console.log('Files:', inputFiles);
		const file = inputFiles.item(0);
		if (!file) return;

		// Only accept PDF files
		if (file.type !== 'application/pdf') {
			console.log('File is not a PDF');
			return;
		}

		await uploadDocument(file);
		alert('Document uploaded!');
		window.location.reload();
	};

	const uploadDocument = async (file: File) => {
		loading = true;
		try {
			const { data, error } = await useApiClient().documents.index.post({ file });

			if (error) {
				console.log('Error uploading document:', error);
				return;
			}

			console.log('Upload response', data);
		} catch (e) {
			console.log('Error uploading document:', e);
		} finally {
			loading = false;
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
		<form bind:this={formEl} onsubmit={handleSubmit} class="flex flex-col">
			<div class="flex items-center border-b border-b-foreground">
				{#if modelStore.isPreloading || loading}
					<div class="pr-2">
						<LoaderCircle class="h-5 w-5 animate-spin" />
					</div>
				{/if}
				<Button
					type="button"
					disabled={loading || modelStore.isPreloading}
					onclick={() => filesInputElement?.click()}
					size="icon"
					class="h-7 w-7 rounded-full disabled:bg-neutral-600"
				>
					<FilePlus onclick={() => filesInputElement?.click()} class="h-4 w-4" />
					<input
						type="file"
						accept="application/pdf"
						hidden
						bind:this={filesInputElement}
						bind:files={inputFiles}
						onchange={handleFilesChange}
					/>
				</Button>
				<textarea
					bind:value={prompt}
					bind:this={inputEl}
					oninput={handleResize}
					onkeydown={handleCtrlEnter}
					disabled={loading || modelStore.isPreloading}
					name="prompt"
					class="flex-1 resize-none overflow-hidden bg-inherit p-2 outline-none"
					placeholder={modelStore.isPreloading
						? `Loading model ${modelStore.selectedModel}...`
						: `Question to ${modelStore.selectedModel}`}
					autocomplete="off"
					tabindex="0"
					dir="auto"
					rows="1"
				></textarea>

				<Button
					type="submit"
					disabled={loading || !prompt.length || modelStore.isPreloading}
					size="icon"
					class="h-7 w-7 rounded-full disabled:bg-neutral-600"
				>
					<ChevronRight class="h-4 w-4" />
				</Button>
			</div>
		</form>
	</div>
</div>
