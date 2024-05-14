<script lang="ts">
	import type { TokensList } from 'marked';

	import { marked } from 'marked';
	let { content }: { content: string } = $props();

	content = `
	Bee-utiful topic!

Here are some fun facts about bees:

1. **Honey, I'm home**: Bees communicate through complex dances, called waggle dances, to tell each other where to find food (like nectar-rich flowers) and water.
2. **Busy bees**: A single honey bee colony can have up to 60,000 individual bees! They work together like a well-oiled machine to collect nectar, pollen, and water.
3. **Bee-autiful social structure**: Bees live in highly organized colonies with three castes: queen, worker (female), and drone (male). The queen lays eggs, workers do all the work, and drones mate with the queen.
4. **Pollination pros**: Bees are responsible for pollinating many plant species, including fruits, vegetables, nuts, and seeds. Without bees, many crops would disappear!
5. **Stinging situation**: Honey bees can sting only once, as their stingers get stuck in human skin. Other bee species, like carpenter bees or bumblebees, don't have barbed stingers and can sting multiple times.
6. **Honey, I'm sweet**: Bees collect nectar from flowers to make honey, which is a sweet, viscous fluid used as food for themselves and their colonies.

Some interesting bee-related questions:

* What's the average lifespan of a worker bee?
* Can bees see colors like humans do?
* Do bees have a special way of communicating with each other?

Let me know if you'd like to explore any of these topics further!

Here are some fun facts about bees:

1. **Honey, I'm home**: Bees communicate through complex dances, called waggle dances, to tell each other where to find food (like nectar-rich flowers) and water.
2. **Busy bees**: A single honey bee colony can have up to 60,000 individual bees! They work together like a well-oiled machine to collect nectar, pollen, and water.
3. **Bee-autiful social structure**: Bees live in highly organized colonies with three castes: queen, worker (female), and drone (male). The queen lays eggs, workers do all the work, and drones mate with the queen.
4. **Pollination pros**: Bees are responsible for pollinating many plant species, including fruits, vegetables, nuts, and seeds. Without bees, many crops would disappear!
5. **Stinging situation**: Honey bees can sting only once, as their stingers get stuck in human skin. Other bee species, like carpenter bees or bumblebees, don't have barbed stingers and can sting multiple times.
6. **Honey, I'm sweet**: Bees collect nectar from flowers to make honey, which is a sweet, viscous fluid used as food for themselves and their colonies.

Some interesting bee-related questions:

* What's the average lifespan of a worker bee?
* Can bees see colors like humans do?
* Do bees have a special way of communicating with each other?

Let me know if you'd like to explore any of these topics further!`;

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
	:global(ol > li) {
		/* Indent list items */
		padding-left: 1rem;
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
