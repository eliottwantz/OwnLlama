<script lang="ts">
	import type { ChatMessage } from '$lib/components/Chat/chat.svelte';
	import { marked, type TokensList } from 'marked';

	let { message }: { message: ChatMessage } = $props();
	let tokens: TokensList = $derived(marked.lexer(message.answer));

	const renderer = new marked.Renderer();
	// For code blocks with simple backticks
	renderer.codespan = (code) => {
		return `<code>${code.replaceAll('&amp;', '&')}</code>`;
	};
</script>

<div class="flex flex-col gap-y-5">
	<span class="text-2xl">{message.question}</span>

	{#if message.answer}
		<div>
			<div class="flex items-baseline gap-x-1">
				<span class="font-bold">{message.model}</span>
				<span class="hidden text-sm text-muted-foreground">
					{new Date(message.timestamp).toLocaleString()}
				</span>
			</div>
			<div class="text-neutral-800 dark:text-neutral-200">
				{#each tokens as token}
					{@html marked.parse(token.raw, {
						renderer,
						gfm: true,
						breaks: true
					})}
				{/each}
			</div>
		</div>
	{/if}
</div>

<style lang="postcss">
	:global(strong) {
		@apply !text-foreground;
	}
	:global(ul) {
		@apply py-2;
		/* Show ordered list bullets */
		list-style-type: disc !important;
		/* Show numbers */
		list-style-position: inside !important;
	}
	:global(ol) {
		/* Show ordered list bullets */
		list-style-type: decimal !important;
		/* Show numbers */
		list-style-position: inside !important;
	}
	:global(ol > li, ul > li) {
		/* Indent list items */
		padding-left: 1rem !important;
	}
	:global(td) {
		@apply px-4 pt-1;
	}
	:global(tbody > tr) {
		@apply border-b;
	}
	:global(thead > tr) {
		@apply border-b-2;
	}
	:global(table) {
		@apply my-3;
	}
</style>
