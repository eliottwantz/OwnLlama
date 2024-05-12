<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<div class="mx-auto max-w-screen-2xl px-8">
	<h1 class="my-10 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
		OwnLlama 🔥😁👍
	</h1>
	{@render children()}
</div>
