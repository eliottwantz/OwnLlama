<script lang="ts">
	import Chat from '$lib/components/Chat.svelte';
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

{#if errorMsg}
	<p class="mb-2 text-lg text-red-500">{errorMsg}</p>
{/if}
{#if llmResponse}
	<div class="mb-2 text-lg">
		<Chat content={llmResponse} />
	</div>
{/if}
<form onsubmit={handleSubmit} class="flex flex-col gap-4">
	<input
		bind:value={prompt}
		name="prompt"
		class="border-0 border-b border-b-white bg-inherit p-2 text-white focus:border-b-white focus:ring-0"
		placeholder="Question"
		autocomplete="off"
	/>

	<button disabled={loading} class="self-start rounded-md px-3 py-1">
		{#if loading}
			<span>Loading...</span>
		{:else}
			<span>Submit</span>
		{/if}
	</button>
</form>
