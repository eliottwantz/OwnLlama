<script lang="ts">
	import { client } from '$lib/api/client';
	import type { EventHandler } from 'svelte/elements';

	let content = $state('');
	let errorMsg = $state('');
	let successMsg = $state('');
	let uploading = $state(false);

	const handleSubmit: EventHandler<SubmitEvent, HTMLFormElement> = async (e) => {
		e.preventDefault();

		uploading = true;

		const { data, error } = await client.documents.index.post({ pageContent: content });

		uploading = false;

		if (error) {
			errorMsg = error.value;
			return;
		}

		console.log('data', data);

		content = '';
		successMsg = data.msg;
		setTimeout(() => (successMsg = ''), 3000);
		console.log('Upload successful');
	};
</script>

<h2 class="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
	Add a document
</h2>

{#if errorMsg}
	<p class="mb-2 text-lg text-red-500">{errorMsg}</p>
{/if}
{#if successMsg}
	<p class="mb-2 text-lg">{successMsg}</p>
{/if}
<form action="/api/documents" method="post" onsubmit={handleSubmit} class="flex flex-col gap-4">
	<textarea
		bind:value={content}
		name="content"
		class="bg-neutral-900 p-2 text-white"
		placeholder="Enter the content of your document"
		rows="10"
	></textarea>

	<button disabled={uploading} class="self-start rounded-md bg-neutral-800 px-3 py-1">
		{#if uploading}
			<span>Uploading...</span>
		{:else}
			<span>Submit</span>
		{/if}
	</button>
</form>
