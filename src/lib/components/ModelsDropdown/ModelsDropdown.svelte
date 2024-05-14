<script lang="ts">
	import { getApiClient } from '$lib/api/client';
	import { useModelStore } from '$lib/components/ModelsDropdown/models.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils.js';
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import { tick } from 'svelte';

	let modelsStore = useModelStore();
	let open = $state(false);
	let searchValue = $state('');
	let selectedValue = $derived(
		modelsStore.models.find((m) => m === searchValue) ?? 'Select a model...'
	);

	$inspect(selectedValue);

	$effect(() => {
		fetchModels();
	});

	$effect(() => {
		const selectedModel = localStorage.getItem('model');
		console.log('Selected model:', selectedModel);
		if (selectedModel) {
			searchValue = selectedModel;
		}
	});

	$effect(() => {
		if (selectedValue === 'Select a model...') {
			return;
		}
		modelsStore.selectedModel = selectedValue;
	});

	$effect(() => {
		if (selectedValue === 'Select a model...') {
			return;
		}
		console.log('Preloading model:', selectedValue);

		modelsStore.isPreloading = true;
		getApiClient()
			.ollama.preload({ model: selectedValue })
			.get()
			.then((res) => {
				if (res.error) {
					console.log('Failed to preload model:\n', res.error);
					return;
				}

				console.log('Preloaded model:', selectedValue);
			})
			.catch((err) => {
				console.log('Failed to preload model:\n', err);
				return;
			})
			.finally(() => {
				modelsStore.isPreloading = false;
			});
	});

	const fetchModels = async () => {
		const { data, error } = await getApiClient().models.get();
		if (error) {
			console.log('Failed to get models:\n', error);
			return;
		}

		if (!data.models?.length) {
			console.log('No downloaded models');
			return;
		}

		modelsStore.models = data.models;
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
			{selectedValue}
			<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-[200px] p-0">
		<Command.Root>
			<Command.Input placeholder="Search model..." />
			<Command.Empty>No model found.</Command.Empty>
			<Command.Group>
				{#each modelsStore.models as model}
					<Command.Item
						value={model}
						onSelect={(currentValue) => {
							searchValue = currentValue;
							localStorage.setItem('model', searchValue);
							closeAndFocusTrigger(ids.trigger);
						}}
					>
						<Check class={cn('mr-2 h-4 w-4', searchValue !== model && 'text-transparent')} />
						{model}
					</Command.Item>
				{/each}
			</Command.Group>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
