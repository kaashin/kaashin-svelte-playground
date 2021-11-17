<script>
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import jsonFormat from 'json-format';
	import _ from 'lodash';
	import { uid } from 'uid';

	export let segment = {
		hwyNumber: '',
		name: '',
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
	// let { ACPLifts, baseLifts } = segment;

	let mixTypes = [
		{ type: 'H1', unitPrice: 80 },
		{ type: 'H2', unitPrice: 70 },
		{ type: 'L1', unitPrice: 60 },
		{ type: 'L11', unitPrice: 70 },
		{ type: 'M1', unitPrice: 100 },
		{ type: 'S1', unitPrice: 100 },
		{ type: 'S2', unitPrice: 75 },
		{ type: 'S3', unitPrice: 70 }
	];

	let baseTypes = [
		{ type: '2-20', unitPrice: 31 },
		{ type: '2-25', unitPrice: 40 },
		{ type: '2-40', unitPrice: 31 },
		{ type: '4-20', unitPrice: 25 },
		{ type: '4-25', unitPrice: 25 },
		{ type: '4-40', unitPrice: 28 },
		{ type: '6-80', unitPrice: 20 },
		{ type: '6-125', unitPrice: 30 },
		{ type: '7-40', unitPrice: 21 }
	];

	// Assume density as t/m3
	let materialTypes = [
		{ type: 'ACP', density: 2.36 },
		{ type: 'CSBC', density: 3.0 },
		{ type: 'GBC', density: 2.35 },
		{ type: 'Pit Run', density: 2.2 },
		{ type: 'Surfacing Gravel', density: 2.0 }
	];

	let shoulderTypes = ['Curb', 'Sideslope'];

	let acpBinderTypes = ['PG 52-34', 'PG 58-28', 'PG 64-28', 'PG 64-34', 'PG 64-37'];

	// Milling depth unit price based on $/m2
	let millingDepth = [
		{ depth: 10, unitPrice: 2.5 },
		{ depth: 20, unitPrice: 2.5 },
		{ depth: 30, unitPrice: 2.5 },
		{ depth: 40, unitPrice: 2.5 },
		{ depth: 50, unitPrice: 2.5 },
		{ depth: 60, unitPrice: 2.5 },
		{ depth: 70, unitPrice: 2.5 },
		{ depth: 80, unitPrice: 5.0 },
		{ depth: 90, unitPrice: 5.0 },
		{ depth: 100, unitPrice: 5.0 },
		{ depth: 110, unitPrice: 5.0 },
		{ depth: 120, unitPrice: 5.0 }
	];

	// ===========================================================================
	// Lifecycle
	// ===========================================================================
	onMount(async () => {
		const getSavedLifts = localStorage.getItem('fill-calc-segment');
		const obj = JSON.parse(getSavedLifts);
		if (obj) {
			segment = obj;
		}

		// ACPLifts = [...obj.ACPLifts];
		// baseLifts = [...obj.baseLifts];
	});

	// ===========================================================================
	// Functions
	// ===========================================================================
	function onAddACPLift() {
		const newLift = {
			key: uid(8),
			mixType: 'H1',
			binderType: '',
			overlayThickness: 0,
			topWidth: getTopWidth({
				type: 'ACP',
				isTop: segment.ACPLifts.length === 0
			}),
			bottomWidth: 0,
			tonnage: 0,
			ACPCost: 0
		};
		segment.ACPLifts = [...segment.ACPLifts, newLift];
	}

	function onAddBaseLift() {
		const newLift = {
			key: uid(8),
			materialType: 'GBC',
			baseType: '2-25',
			baseThickness: 0,
			topWidth: getTopWidth({
				type: 'BASE',
				isTop: segment.baseLifts.length === 0
			}),
			bottomWidth: 0,
			tonnage: 0,
			baseCost: 0
		};
		segment.baseLifts = [...segment.baseLifts, newLift];
	}

	function getTopWidth({ liftArray = [], type, isTop = true, index }) {
		// This function will get the top width of the layer
		// Determine if current layer is the top of the lifts
		// - if it is, it is equal to road width
		// - if not, equal to bottom width of previous layer
		switch (type) {
			case 'ACP':
				if (isTop) {
					return segment.proposedTopWidth;
				} else {
					if (index) {
						// if an index is provided then it is existing and take layer before it
						return segment.ACPLifts[index - 1].bottomWidth;
					} else {
						return _.last(segment.ACPLifts).bottomWidth;
					}
				}
				break;
			case 'BASE':
				if (isTop) {
					if (segment.ACPLifts.length > 0) {
						return _.last(segment.ACPLifts).bottomWidth;
					} else {
						return segment.proposedTopWidth;
					}
				} else {
					if (index) {
						return segment.baseLifts[index - 1].bottomWidth;
					} else {
						return _.last(segment.baseLifts).bottomWidth;
					}
				}
				break;
			default:
				return 0;
				break;
		}
	}
	function onRemoveACPLift(key) {
		const index = segment.ACPLifts.findIndex((obj) => obj.key === key);
		let newArr = [...segment.ACPLifts];
		if (index >= 0) {
			newArr.splice(index, 1);
		}
		segment.ACPLifts = [...newArr];
	}

	function onRemoveBaseLift(key) {
		const index = segment.baseLifts.findIndex((obj) => obj.key === key);
		let newArr = [...segment.baseLifts];
		if (index >= 0) {
			newArr.splice(index, 1);
		}
		segment.baseLifts = [...newArr];
	}

	function calculateACPLiftRows(lifts) {
		const calculatedLifts = [...lifts];
		for (let index = 0; index < lifts.length; index++) {
			const row = lifts[index];

			let { topWidth, bottomWidth, tonnage, ACPCost, ...rest } = row;

			// Determine the top width
			topWidth = getTopWidth({
				liftArray: calculatedLifts,
				type: 'ACP',
				isTop: index === 0,
				index
			});

			// Calculate bottom width
			let leftWidth = 0;
			let rightWidth = 0;
			if (segment.leftShoulder === 'Sideslope') {
				leftWidth = (segment.sideSlopeRatio * row.overlayThickness) / 1000;
			}
			if (segment.rightShoulder === 'Sideslope') {
				rightWidth = (segment.sideSlopeRatio * row.overlayThickness) / 1000;
			}

			bottomWidth = topWidth + leftWidth + rightWidth;

			// Calculate tonnage
			const density = materialTypes.find((obj) => obj.type === 'ACP').density;
			tonnage =
				((topWidth + bottomWidth) / 2) *
				(row.overlayThickness / 1000) *
				(segment.length * 1000) *
				density;

			// Calculate cost
			const unitPrice = mixTypes.find((obj) => obj.type === row.mixType).unitPrice;

			ACPCost = tonnage * unitPrice;

			calculatedLifts[index] = {
				bottomWidth,
				tonnage,
				ACPCost,
				topWidth,
				...rest
			};
		}

		segment.totalACPCost = calculatedLifts.reduce((acc, cur) => {
			const rowCost = cur.ACPCost ? cur.ACPCost : 0;
			return acc + rowCost;
		}, 0);

		return calculatedLifts;
	}

	function calculateBaseLiftRows(lifts) {
		const calculatedLifts = [...lifts];
		for (let index = 0; index < segment.baseLifts.length; index++) {
			const row = segment.baseLifts[index];

			let { topWidth, bottomWidth, tonnage, baseCost, ...rest } = row;

			// Determine the top width
			topWidth = getTopWidth({
				liftArray: calculatedLifts,
				type: 'BASE',
				isTop: index === 0,
				index
			});

			// Calculate bottom width
			let leftWidth = 0;
			let rightWidth = 0;
			if (segment.leftShoulder === 'Sideslope') {
				leftWidth = (segment.sideSlopeRatio * row.baseThickness) / 1000;
			}
			if (segment.rightShoulder === 'Sideslope') {
				rightWidth = (segment.sideSlopeRatio * row.baseThickness) / 1000;
			}

			bottomWidth = topWidth + leftWidth + rightWidth;

			// Calculate tonnage
			const density = materialTypes.find((obj) => obj.type === row.materialType).density;
			tonnage =
				((topWidth + bottomWidth) / 2) *
				(row.baseThickness / 1000) *
				(segment.length * 1000) *
				density;

			// Calculate cost
			const unitPrice = baseTypes.find((obj) => obj.type === row.baseType).unitPrice;

			baseCost = tonnage * unitPrice;

			calculatedLifts[index] = {
				bottomWidth,
				tonnage,
				baseCost,
				topWidth,
				...rest
			};
		}

		segment.totalBaseCost = calculatedLifts.reduce((acc, cur) => {
			const rowCost = cur.baseCost ? cur.baseCost : 0;
			return acc + rowCost;
		}, 0);

		return calculatedLifts;
	}

	// ===========================================================================
	// Other
	// ===========================================================================
	$: {
		// calculate length
		segment.length = segment.toKm - segment.fromKm;

		// calculate lift rows
		segment.ACPLifts = calculateACPLiftRows(segment.ACPLifts);
		segment.baseLifts = calculateBaseLiftRows(segment.baseLifts);

		const config = {
			type: 'space',
			size: 2
		};
		const newJson = { ...segment };
		newJson.ACPLifts = segment.ACPLifts;
		newJson.baseLifts = segment.baseLifts;

		// if segment name is made empty, replace with default
		if (!segment.name) {
			segment.name = 'Segment';
		}
	}
</script>

<section>
	<h5 contenteditable="true" bind:innerHTML={segment.name} />
	<div class="form__field">
		<label for="fromKm">From (km)</label>
		<input type="number" name="fromKm" bind:value={segment.fromKm} />
	</div>
	<div class="form__field">
		<label for="toKm">To (km)</label>
		<input type="number" name="toKm" bind:value={segment.toKm} />
	</div>
	<div class="form__field">
		Length (km): {Math.round(segment.length * 1000) / 1000}
	</div>
	<div class="form__field">
		<label for="leftShoulder">Left Shoulder</label>
		<select bind:value={segment.leftShoulder}>
			{#each shoulderTypes as shoulderType}
				<option value={shoulderType}>{shoulderType}</option>
			{/each}
		</select>
	</div>
	<div class="form__field">
		<label for="rightShoulder">Right Shoulder</label>
		<select bind:value={segment.rightShoulder}>
			{#each shoulderTypes as shoulderType}
				<option value={shoulderType}>{shoulderType}</option>
			{/each}
		</select>
	</div>
	<div class="form__field">
		<label for="sideSlopeRatio">Side Slope Ratio (x:1)</label>
		<input type="number" name="sideSlopeRatio" bind:value={segment.sideSlopeRatio} />
	</div>
	<div class="form__field">
		<label for="proposedTopWidth">Proposed Top Width (m)</label>
		<input type="number" name="proposedTopWidth" bind:value={segment.proposedTopWidth} />
	</div>

	<h6>ACP Lifts</h6>
	{#if segment.ACPLifts.length === 0}
		<p>No lifts added</p>
	{:else}
		<table transition:slide>
			<thead>
				<tr>
					<td>Lift</td>
					<td>Type</td>
					<td>Binder Type</td>
					<td>Overlay Thickness (mm)</td>
					<td>Top of Lift Width (m)</td>
					<td>Bottom of Lift Width (m)</td>
					<td>Tonnage (t)</td>
					<td>ACP Cost</td>
				</tr>
			</thead>
			<tbody>
				{#each segment.ACPLifts as lift, index (lift.key)}
					<tr>
						<td>{index + 1}</td>
						<td>
							<select bind:value={lift.mixType}>
								{#each mixTypes as mixType}
									<option value={mixType.type}>{mixType.type}</option>
								{/each}
							</select>
						</td>
						<td>
							<select bind:value={lift.binderType}>
								{#each acpBinderTypes as binderType}
									<option value={binderType}>{binderType}</option>
								{/each}
							</select>
						</td>
						<td style="width:100px">
							<input type="number" bind:value={lift.overlayThickness} style="width:80px" />
						</td>
						<td>
							{Math.round(lift.topWidth * 1000) / 1000}
						</td>
						<td>
							{Math.round(lift.bottomWidth * 1000) / 1000}
						</td>
						<td>
							{Math.round(lift.tonnage * 1000) / 1000}
						</td>
						<td>
							{Math.round(lift.ACPCost * 100) / 100}
						</td>
						<td>
							<button on:click={() => onRemoveACPLift(lift.key)}>Remove</button>
						</td>
					</tr>
				{/each}
				<tr>
					<td />
					<td />
					<td />
					<td />
					<td />
					<td />
					<td />
					<td>${Math.round(segment.totalACPCost * 100) / 100}</td>
					<td />
				</tr>
			</tbody>
		</table>
	{/if}
	<button on:click={onAddACPLift}>Add ACP Lift</button>

	<h6>Base Lifts</h6>
	{#if segment.baseLifts.length === 0}
		<p>No lifts added</p>
	{:else}
		<table>
			<thead>
				<tr>
					<td>Lift</td>
					<td>Material</td>
					<td>Designation</td>
					<td>Base Thickness (mm)</td>
					<td>Top Width</td>
					<td>Bottom Width</td>
					<td>Tonnage</td>
					<td>Base Cost</td>
				</tr>
			</thead>
			<tbody>
				{#each segment.baseLifts as lift, index (lift.key)}
					<tr transition:fade>
						<td>{index + 1}</td>
						<td>
							<select bind:value={lift.materialType}>
								{#each materialTypes as materialType}
									<option value={materialType.type}>{materialType.type}</option>
								{/each}
							</select>
						</td>
						<td>
							<select bind:value={lift.baseType}>
								{#each baseTypes as baseType}
									<option value={baseType.type}>{baseType.type}</option>
								{/each}
							</select>
						</td>
						<td>
							<input type="number" bind:value={lift.baseThickness} />
						</td>
						<td>
							{Math.round(lift.topWidth * 1000) / 1000}
						</td>
						<td>
							{Math.round(lift.bottomWidth * 1000) / 1000}
						</td>
						<td>
							{Math.round(lift.tonnage * 1000) / 1000}
						</td>
						<td>
							{Math.round(lift.baseCost * 100) / 100}
						</td>
						<td>
							<button on:click={() => onRemoveBaseLift(lift.key)}>Remove</button>
						</td>
					</tr>
				{/each}
				<tr>
					<td />
					<td />
					<td />
					<td />
					<td />
					<td />
					<td />
					<td>${Math.round(segment.totalBaseCost * 100) / 100}</td>
					<td />
				</tr>
			</tbody>
		</table>
	{/if}
	<button on:click={onAddBaseLift}>Add Base Lift</button>
	<h6>Summary</h6>
	Total segment cost: ${Math.round(segment.totalACPCost + segment.totalBaseCost)}
</section>

<style>
	table,
	thead {
		border: solid 1px var(--primary-accent-color);
		border-collapse: collapse;
	}
	thead > tr > td {
		text-align: center;
		padding-block: 0.5rem;
		padding-inline: 1rem;
	}
	tbody > tr > td {
		text-align: center;
	}
	tbody > tr > td {
		padding-block: 0.5rem;
	}
	tbody > tr:hover {
		transition: all ease-out 0.2s;
		border-left: solid 4px var(--primary-accent-color);
		background-color: #114349;
	}
</style>
