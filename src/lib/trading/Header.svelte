<script>
	import { user, auth } from '$lib/trading/supabase.js';

	// ===========================================================================
	// Functions
	// ===========================================================================
	async function handleSignOut() {
		try {
			const response = await auth.signOut();
			console.log({ response });
			if (response.error) throw error;
		} catch (error) {
			console.error(error);
		} finally {
			console.log('all done');
		}
	}
</script>

<div class="header">
	<div class="brand"><a href="/trading/">Trading Panel</a></div>
	<nav>
		{#if $user}
			<a href="/trading/watchlist">Watchlist</a>
		{/if}
	</nav>
	<div>
		{#if $user}
			Logged in
			<button on:click={handleSignOut}>Sign Out</button>
		{:else}
			<a href="/trading/signup">Signup</a>

			<a href="/trading/login">Login</a>
		{/if}
	</div>
</div>

<style>
	.header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}
</style>
