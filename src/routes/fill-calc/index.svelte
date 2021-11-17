<script>
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import jsonFormat from 'json-format';
	import _ from 'lodash';

	import { uid } from 'uid';
	import Icon from 'svelte-awesome/components/Icon.svelte';
	import { faTrashAlt } from '@fortawesome/free-regular-svg-icons';

	import Segment from '$lib/fill-calc/Segment.svelte';

	let projectData = {
		projectName: '',
		projectNumber: '',
		segments: []
	};

	let segments = [];

	let selectedSegment = -1;
	let selectedSegmentKey = '';

	let projectDataJSON = '';

	// ===========================================================================
	// Lifecycle
	// ===========================================================================
	onMount(async () => {
		const getSavedLifts = localStorage.getItem('fill-calc-projectData');
		const obj = JSON.parse(getSavedLifts);
		if (obj) {
			projectData = obj;
		}

		// segments = [...obj.segments];
		projectData.segments = [...obj.segments];

		// ACPLifts = [...obj.ACPLifts];
		// baseLifts = [...obj.baseLifts];
	});

	// ===========================================================================
	// Functions
	// ===========================================================================
	function onAddSegment() {
		const newSegment = {
			key: uid(8),
			name: 'New Segment',
			hwyNumber: '',
			fromKm: 0,
			toKm: 0,
			length: 0,
			description: '',
			leftShoulder: '',
			rightShoulder: '',
			sideSlopeRatio: 0,
			proposedTopWidth: 0,
			ACPLifts: [],
			baseLifts: [],
			totalACPCost: 0,
			totalBaseCost: 0
		};

		console.log('add a new segment!');

		projectData.segments = [...projectData.segments, newSegment];
		console.log(projectData.segments);
	}

	function onSave() {
		localStorage.setItem('fill-calc-projectData', projectDataJSON);
	}

	function onRemoveSegment(key) {
		const index = projectData.segments.findIndex((obj) => obj.key === key);
		let newArr = [...projectData.segments];
		if (index >= 0) {
			newArr.splice(index, 1);
		}
		projectData.segments = [...newArr];
		// Check if the current view is shoing the item that is deleted
		if (projectData.segments[selectedSegment].key === key) {
			selectedSegment = -1;
		}
	}

	function onClear() {
		localStorage.setItem('fill-calc-projectData', '');
	}

	function onSelectSegment(index) {
		console.log(index);
		selectedSegment = index;
	}

	// ===========================================================================
	// Other
	// ===========================================================================
	$: {
		// calculate length
		// projectData.length = projectData.toKm - projectData.fromKm;

		// 	// calculate lift rows
		// 	ACPLifts = calculateACPLiftRows(ACPLifts);
		// 	baseLifts = calculateBaseLiftRows(baseLifts);

		// projectData.segments = [...segments];

		const config = {
			type: 'space',
			size: 2
		};
		const newJson = { ...projectData };
		// newJson.segments = [...segments];
		// newJson.ACPLifts = ACPLifts;
		// newJson.baseLifts = baseLifts;
		projectDataJSON = jsonFormat(newJson, config);
	}

	$: totalACPCost = projectData.segments.reduce((acc, cur) => acc + cur.totalACPCost, 0);
	$: totalBaseCost = projectData.segments.reduce((acc, cur) => acc + cur.totalBaseCost, 0);
	$: totalCost = totalACPCost + totalBaseCost;
	$: {
		if (!projectData.segments[selectedSegment]) {
			selectedSegment = -1;
		} else {
			selectedSegmentKey = selectedSegment >= 0 ? projectData.segments[selectedSegment].key : '';
		}
	}
</script>

<main>
	<h2>Dave's Fill Calculator</h2>
	<div>
		<button on:click={onSave}>Save</button>
		<button on:click={onClear}>Clear</button>
	</div>
	<section>
		<div class="form__field">
			<label for="projectName">Project Name</label>
			<input name="projectName" type="text" bind:value={projectData.projectName} />
		</div>
		<div class="form__field">
			<label for="projectNumber">Project Number</label>
			<input name="projectNumber" type="text" bind:value={projectData.projectNumber} />
		</div>
	</section>
	<section class="segment__container">
		<div class="segment__sidebar">
			<h5>Segments</h5>
			<ul class="segment__menu">
				{#each projectData.segments as segment, index}
					<li transition:slide>
						{#if segment.key === selectedSegmentKey}
							<div class="segment__menu_item__selected" on:click={() => onSelectSegment(index)}>
								{segment.name}
							</div>
						{:else}
							<div class="segment__menu_item" on:click={() => onSelectSegment(index)}>
								{segment.name}
							</div>
						{/if}
						<div class="segment__remove" on:click={() => onRemoveSegment(segment.key)}>
							<Icon data={faTrashAlt} />
						</div>
					</li>
				{/each}
			</ul>
			<button on:click={onAddSegment}>Add Segment</button>
			<h5>Summary</h5>
			<ul>
				<li>Total ACP Cost: ${Math.round(totalACPCost * 100) / 100}</li>
				<li>Total Base Cost: ${Math.round(totalBaseCost * 100) / 100}</li>
				<li>Total Project Cost: ${Math.round(totalCost * 100) / 100}</li>
			</ul>
		</div>
		<div class="segment__main">
			{#if selectedSegment >= 0}
				<Segment bind:segment={projectData.segments[selectedSegment]} />
			{:else}
				<p>Select a segment to view details</p>
			{/if}
		</div>
	</section>
	<!-- <h6>Segments</h6> -->
	<!-- {#each segments as segment, index}
		<div>
			<strong>Segment {index + 1}</strong>
			<Segment bind:segment />
		</div>
	{/each} -->
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.segment__container {
		display: flex;
		flex-direction: grid;
		flex-wrap: wrap;
		width: 90vw;
	}
	.segment__sidebar {
		border-right: solid 1px var(--primary-accent-color);
		min-width: 300px;
		padding-right: 2rem;
	}
	.segment__sidebar > ul {
		list-style: none;
		padding: 0;
	}
	.segment__sidebar > ul > li {
		padding-block: 0.3rem;
	}
	.segment__menu > li {
		cursor: pointer;
		display: flex;
		justify-content: space-between;
	}
	.segment__menu > li:hover {
	}
	.segment__menu_item {
		width: 80%;
	}
	.segment__menu_item {
		width: 80%;
	}
	.segment__menu_item__selected {
		width: 80%;
		border-bottom: solid 2px var(--secondary-accent-color);
	}
	.segment__menu_item:hover {
		border-bottom: solid 2px var(--secondary-accent-color);
	}
	.segment__main {
		padding: 2rem;
	}
	.segment__remove {
	}
	.segment__remove:hover {
		color: var(--tertiary-accent-color);
	}
</style>
