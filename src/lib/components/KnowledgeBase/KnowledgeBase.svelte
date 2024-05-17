<script lang="ts">
	import { useApiClient } from '$lib/api/client';
	import {
		useKnowledgeBaseStore,
		type QdrantPoint
	} from '$lib/components/KnowledgeBase/knowledgebase.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils.js';
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';

	let knowledgeBaseStore = useKnowledgeBaseStore();
	let open = $state(false);
	let searchValue = $state('');
	let selectedDocument = $derived(
		knowledgeBaseStore.documents.find((d) => d.payload.metadata.title === searchValue) ?? null
	);

	$effect(() => {
		fetchDocuments();
	});

	$effect(() => {
		knowledgeBaseStore.selectedDocument = selectedDocument;
	});

	const fetchDocuments = async () => {
		const { data, error } = await useApiClient().documents.index.get();
		if (error) {
			console.log('Failed to get documents:\n', error.status, error.value.message);
			return;
		}

		if (error) {
			console.log('Failed to get documents:\n', error);
			return;
		}

		if (!data.documents?.length) {
			console.log('No downloaded documents');
			return;
		}

		console.log('Documents:', data);

		knowledgeBaseStore.documents = data.documents as QdrantPoint[];
	};

	const closeAndFocusTrigger = (triggerId: string) => {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	};
</script>

<Popover.Root bind:open let:ids>
	<Popover.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			variant="outline"
			role="combobox"
			aria-expanded={open}
			class="w-[200px] justify-between"
		>
			{selectedDocument?.payload.metadata.title ?? 'Select a document...'}
			<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-[200px] p-0">
		<Command.Root>
			<Command.Input placeholder="Search model..." />
			<Command.Empty>No model found.</Command.Empty>
			<Command.Group>
				{#each knowledgeBaseStore.documents as doc}
					<Command.Item
						value={doc.payload.metadata.title}
						onSelect={(currentValue) => {
							searchValue = currentValue;
							closeAndFocusTrigger(ids.trigger);
						}}
					>
						<Check
							class={cn(
								'mr-2 h-4 w-4',
								searchValue !== doc.payload.metadata.title && 'text-transparent'
							)}
						/>
						{doc.payload.metadata.title}
					</Command.Item>
				{/each}
			</Command.Group>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
