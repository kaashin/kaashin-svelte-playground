<script>
	import { user, auth, supabase } from '$lib/trading/supabase.js';

	async function getData() {
		const { data, error } = await supabase.from('watchlist').select();

		return data;
	}

	const data = getData();
</script>

<main>
	<h1>Trading Panel</h1>

	<div />
</main>
