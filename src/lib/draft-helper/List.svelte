<script>
	import { uid } from 'uid';
	import { amp, browser, dev, mode, prerendering } from '$app/env';
	import { dndzone, overrideItemIdKeyNameBeforeInitialisingDndZones } from 'svelte-dnd-action';
	import Typeahead from 'svelte-typeahead';

	export let section = {
		title: '',
		list: [],
		isDraftList: false
	};
	
	export let save;
	export let compareLists;
	export let playerList = [];

	let nameInput = '';

	// ===========================================================================
	// DND Config
	// ===========================================================================
	const flipDurationMs = 200;
	// overrideItemIdKeyNameBeforeInitialisingDndZones('id');
	let dropTargetStyle;

	function handleDndConsider(e) {
		console.log(e.detail);
		section.list = e.detail.items;
		dropTargetStyle = {
			border: 'dashed 2px grey'
		};
	}
	function handleDndFinalize(e) {
		section.list = e.detail.items;
	}

	// ===========================================================================
	// Typeahead
	// ===========================================================================
	let extract = (item) => item;

	// ===========================================================================
	// Functions
	// ===========================================================================
	const addPlayer = (e) => {
		e.preventDefault();
		section.list = [
			...section.list,
			{
				id: uid(4),
				name: nameInput,
				isDrafted: false
			}
		];
		nameInput = '';

		compareLists();

		save();
	};

	const removePlayer = (removeIndex) => {
		const newList = section.list.filter((item, index) => index != removeIndex);
		section.list = [...newList];

		compareLists();

		save();
	};

	// ===========================================================================
	// Actions
	// ===========================================================================
</script>

<div>
	<p
		contenteditable="true"
		bind:innerHTML={section.title}
		on:blur={() => {
			save();
		}}
	/>
	<!-- <form> -->
	<!-- <input type="Text" bind:value={nameInput} /> -->
	<div class="search__container">
		<Typeahead
			data={playerList}
			{extract}
			hideLabel
			bind:value={nameInput}
			on:select={addPlayer}
			let:result
			let:index
		>
			<div style="color: red; font-weight: bold;">
				{@html result.string}
			</div>
		</Typeahead>
	</div>
	<!-- <button on:click={addPlayer}>Add</button> -->
	<!-- </form> -->
	<section
		use:dndzone={{
			items: section.list,
			flipDurationMs,
			dropTargetStyle,
			dropTargetClasses: ['dndzone__hover'],
			dropFromOthersDisabled: true
		}}
		on:consider={handleDndConsider}
		on:finalize={handleDndFinalize}
		class="dndzone"
	>
		{#each section.list as item, index (item.id)}
			<div class="list__row">
				{#if item.isDrafted}
					<span class="drafted">{item.name}</span>
				{:else}
					{item.name}
				{/if}
				<button
					class="button__remove"
					on:click={() => {
						removePlayer(index);
					}}>X</button
				>
			</div>
		{/each}
	</section>
</div>

<style>
	.dndzone {
		min-height: 100px;
	}
	.drafted {
		text-decoration: line-through;
	}
	.search__container {
		padding-block: 0.5rem;
	}
	.list__row {
		display: flex;
		flex-direction: row;
		width: 250px;
		justify-content: space-between;
		margin-block: 0.4rem;
	}
	.button__remove {
		font-size: 0.8rem;
		padding: 0.5rem;
	}
</style>
