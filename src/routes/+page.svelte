<script lang="ts">
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

<h2 class="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
	Ask a question to your OwnLlama
</h2>

{#if errorMsg}
	<p class="mb-2 text-lg text-red-500">{errorMsg}</p>
{/if}
{#if llmResponse}
	<p class="mb-2 text-lg">{llmResponse}</p>
{/if}
<form onsubmit={handleSubmit} class="flex flex-col gap-4">
	<input
		bind:value={prompt}
		name="prompt"
		class="bg-neutral-900 p-2 text-white"
		placeholder="Ask a question"
	/>

	<button disabled={loading} class="self-start rounded-md bg-neutral-800 px-3 py-1">
		{#if loading}
			<span>Loading...</span>
		{:else}
			<span>Submit</span>
		{/if}
	</button>
</form>
