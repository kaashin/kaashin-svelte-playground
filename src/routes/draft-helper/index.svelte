<script context="module">
	import axios from 'axios';

	export async function load({ page }) {
		// Get all the NHL Teams from the NHL API
		const teamResponse = await axios.get(
			'https://statsapi.web.nhl.com/api/v1/teams/?expand=team.roster'
		);

		let teams = teamResponse.data.teams;

		let players = teams.map((team) => {
			const roster = team.roster.roster;

			const players = roster.map((player) => {
				return player.person.fullName;
			});

			return players;
		});

		let playerList = _.flatten(players);

		return {
			props: {
				playerList
			}
		};
	}
</script>

<script>
	import { onMount } from 'svelte';
	import jsonFormat from 'json-format';
	import List from '$lib/draft-helper/List.svelte';
	import { dndzone, overrideItemIdKeyNameBeforeInitialisingDndZones } from 'svelte-dnd-action';
	import _ from 'lodash';

	export let playerList;

	let sections = [
		{
			id: 0,
			title: 'Drafted Players',
			list: [],
			isDraftList: true
		},
		{
			id: 1,
			title: 'New Section',
			list: [],
			isDraftList: false
		}
	];
	let draftListJSON = '';

	const config = {
		type: 'space',
		size: 2
	};

	// let playerList = ['Sidney Crosby', 'Connor McDavid'];

	// ===========================================================================
	// DND Config
	// ===========================================================================
	const flipDurationMs = 200;
	// overrideItemIdKeyNameBeforeInitialisingDndZones('id');
	let dropTargetStyle;

	function handleDndConsider(e) {
		sections = e.detail.items;
		dropTargetStyle = {
			border: 'dashed 2px grey'
		};
	}
	function handleDndFinalize(e) {
		sections = e.detail.items;
	}

	// ===========================================================================
	// Fucntions
	// ===========================================================================
	let save = () => {
		const newJson = [...sections];
		draftListJSON = jsonFormat(newJson, config);

		localStorage.setItem('draft-lists', draftListJSON);
	};

	let addNewList = () => {
		const newSections = [
			...sections,
			{
				id: sections.length,
				title: 'New Section',
				list: [],
				isDraftList: false
			}
		];
		sections = newSections;

		save();
	};

	let compareLists = () => {
		const draftList = sections.filter((section) => section.isDraftList)[0].list;
		for (let i = 0; i < sections.length; i++) {
			const section = sections[i];
			if (!section.isDraftList) {
				// Ignore comparing this list if it is the draft list.
				const compareArr = _.intersectionBy(draftList, section.list, 'name');
				console.log({ compareArr });

				const newList = section.list.map((obj) => {
					const index = compareArr.findIndex((item) => item.name === obj.name);

					if (index >= 0) {
						obj.isDrafted = true;
						return obj;
					} else {
						obj.isDrafted = false;
						return obj;
					}
				});

				console.log({ newList });
				sections[i].list = newList;
			}
		}
	};

	// =============================================================================
	// Reactions
	// =============================================================================
	$: {
		// Checker to see if items in the draftlist, marks all other arrays to mathc
	}

	onMount(async () => {
		const getSavedLists = localStorage.getItem('draft-lists');
		const obj = JSON.parse(getSavedLists);
		sections = [...obj];
	});
</script>

<main class="container">
	<div
		class="container"
		use:dndzone={{
			items: sections,
			flipDurationMs,
			dropTargetStyle,
			dropTargetClasses: ['dndzone__hover'],
			dropFromOthersDisabled: true
		}}
		on:consider={handleDndConsider}
		on:finalize={handleDndFinalize}
	>
		{#each sections as section (section.id)}
			<div class="column">
				<List bind:section {save} {playerList} {compareLists} />
			</div>
		{/each}
	</div>
	<div class="column">
		<button class="addListButton" on:click={addNewList}>Add New List</button>
	</div>
</main>

<style>
	.container {
		display: flex;
		flex-direction: row;
	}
	.column {
		display: flex;
		flex-direction: column;
		margin: 0.5rem;
		min-width: 200px;
	}
	.addListButton {
		width: 200px;
		height: 200px;
		background-color: var(--primary-background);
		color: var(--primary-text);
		border: dashed 3px var(--primary-accent-color);
		border-radius: 1rem;
	}
	.addListButton:hover {
		background-color: var(--primary-accent-color-dark);
		transition: 0.2s ease-out;
	}
</style>
