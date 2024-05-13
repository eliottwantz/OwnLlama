<script lang="ts">
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils.js';
	import { tick } from 'svelte';
	import { client } from '$lib/api/client';

	let models = $state<string[]>([]);
	let open = $state(false);
	let value = $state('');
	let selectedValue = $derived(models.find((m) => m === value) ?? 'Select a model...');

	$effect(() => {
		fetchModels();
	});

	const fetchModels = async () => {
		const { data, error } = await client.models.get();
		if (error) {
			console.log('Failed to get models:\n', error);
			return;
		}

		if (!data.models?.length) {
			console.log('No downloaded models');
			return;
		}

		models = data.models;
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
				{#each models as model}
					<Command.Item
						value={model}
						onSelect={(currentValue) => {
							value = currentValue;
							closeAndFocusTrigger(ids.trigger);
						}}
					>
						<Check class={cn('mr-2 h-4 w-4', value !== model && 'text-transparent')} />
						{model}
					</Command.Item>
				{/each}
			</Command.Group>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
