<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="mx-auto max-w-screen-2xl px-8">{@render children()}</div>
