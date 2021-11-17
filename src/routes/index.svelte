<script>
	import { page } from '$app/stores';
</script>

<main>
	<h1>Svelte Playground</h1>

	<p>Just a randoom set of mini projects to play around with Svelte.</p>
	
	<ul>
		<li class:active={$page.path === '/fill-calc'}><a sveltekit:prefetch href="/fill-calc">Fill Calculator</a></li>
		<li class:active={$page.path === '/draft-helper'}><a sveltekit:prefetch href="/draft-helper">Draft Helper</a></li>
		<li class:active={$page.path === '/trading'}><a sveltekit:prefetch href="/trading">Trading</a></li>
	</ul>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
</style>
