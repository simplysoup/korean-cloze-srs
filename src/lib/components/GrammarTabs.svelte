<script lang="ts">
	interface Props {
		activeTab: 'details' | 'examples';
		onTabChange: (tab: 'details' | 'examples') => void;
	}

	let { activeTab, onTabChange }: Props = $props();
</script>

<div class="grammar-tabs" role="tablist" aria-label="Grammar point sections">
	<button
		class="grammar-tabs__tab"
		class:grammar-tabs__tab--active={activeTab === 'details'}
		role="tab"
		aria-selected={activeTab === 'details'}
		aria-controls="tab-details"
		onclick={() => onTabChange('details')}
	>
		Details
	</button>
	<button
		class="grammar-tabs__tab"
		class:grammar-tabs__tab--active={activeTab === 'examples'}
		role="tab"
		aria-selected={activeTab === 'examples'}
		aria-controls="tab-examples"
		onclick={() => onTabChange('examples')}
	>
		Examples
	</button>
</div>
