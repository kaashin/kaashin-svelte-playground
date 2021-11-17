<main>
  <slot />
</main>

<style>
  :global(body) {
		background-color: var(--primary-background);
		color: var(--primary-text);
	}
	:global(button) {
		background-color: var(--primary-accent-color);
		border-style: none;
		padding-inline: 1rem;
		padding-block: 0.5rem;
		cursor: pointer;
		transition: ease-in-out 0.2s all;
	}
	:global(button:hover) {
		background-color: var(--secondary-accent-color);
		color: var(--white);
		transition: ease-in-out 0.2s all;
	}
	:global(input) {
		background-color: var(--white-100);
		border-style: none;
		padding-block: 0.5rem;
		padding-inline: 1rem;
	}
	:global(input:disabled) {
		background-color: var(--white-200);
	}
	:global(select) {
		background-color: var(--white-100);
		border-style: none;
		padding-block: 0.5rem;
		padding-inline: 1rem;
	}
	:global(select > option) {
		padding: 0.8rem;
	}
	:global(.form__field) {
		margin: 0.5rem;
	}
	:global(.form__field > label) {
		margin-inline: 0 1rem;
	} 
	:root {
		--primary-background: rgb(23, 22, 26);
		--primary-text: #e6e6ea;
		--white-100: #f4f4f8;
		--white-200: #e6e6ef;
		--primary-accent-color: #2ab7ca;
		--primary-accent-color-dark: #165b64;
		--secondary-accent-color: #fe4a49;
		--tertiary-accent-color: #fed766;
	}
	:global([data-svelte-typeahead]) {
		margin: 0rem;
		max-width: 200px;
	}
	
	:global([data-svelte-search]) {
		background-color: var(--primary-background)
	}	
	:global([data-svelte-search] input[type="search"]) {
		background-color: var(--white-200);
		color: rgb(43, 43, 43);
	}	


</style>