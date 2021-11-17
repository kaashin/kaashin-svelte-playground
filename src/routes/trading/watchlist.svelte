<script context="module">
	import { supabase } from '$lib/trading/supabase.js';
	export async function load() {
		// Collect the watchlist of tickers from Supbase
		const { error, data } = await supabase.from('watchlist').select();

		console.log(data);

		return {
			props: {
				watchlist: ['AAPL']
			}
		};
	}
</script>

<script>
	import { user } from '$lib/trading/supabase.js';

	let newTicker = '';
	export let watchlist;

	// ===========================================================================
	// Functions
	// ===========================================================================

	async function onAddTicker() {
		const { data, error } = await supabase.from('watchlist').insert({
			ticker: newTicker
		});

		console.log({ data, error });
	}
</script>

<main>
	<h3>Watchlist</h3>

	<div>
		<input type="text" bind:value={newTicker} />
		<button on:click={onAddTicker}>Add Ticker</button>
	</div>

	<table>
		<thead>
			<tr>
				<th>Ticker</th>
			</tr>
		</thead>
		<tbody>
			{#each watchlist as item}
				<tr>
					<td>
						{item.ticker}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</main>

<style>
</style>
