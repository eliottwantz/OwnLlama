<script lang="ts">
	import type { TokensList } from 'marked';

	import { marked } from 'marked';
	let { content }: { content: string } = $props();
	let tokens: TokensList = $derived(marked.lexer(content));

	const renderer = new marked.Renderer();
	// For code blocks with simple backticks
	renderer.codespan = (code) => {
		return `<code>${code.replaceAll('&amp;', '&')}</code>`;
	};
</script>

<div>
	{#each tokens as token}
		{@html marked.parse(token.raw, {
			renderer,
			gfm: true,
			breaks: true
		})}
	{/each}
</div>

<style lang="postcss">
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
