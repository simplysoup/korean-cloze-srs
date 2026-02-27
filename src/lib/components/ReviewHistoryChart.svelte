<script lang="ts">
	import { Chart, registerables } from 'chart.js';

	let { period = 'daily' }: { period?: 'hourly' | 'daily' } = $props();

	let activePeriod = $state<'hourly' | 'daily'>('daily');
	let canvas: HTMLCanvasElement | undefined = $state();
	let chart: Chart | undefined;
	let loading = $state(false);

	Chart.register(...registerables);

	async function fetchData(p: 'hourly' | 'daily') {
		loading = true;
		try {
			const res = await fetch(`/api/stats/review-history?period=${p}`);
			if (!res.ok) return;
			const data = await res.json();
			renderChart(data);
		} finally {
			loading = false;
		}
	}

	function renderChart(data: { labels: string[]; correct: number[]; incorrect: number[] }) {
		if (!canvas) return;
		if (chart) chart.destroy();

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		chart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: data.labels,
				datasets: [
					{
						label: 'Correct',
						data: data.correct,
						backgroundColor: 'rgba(34, 197, 94, 0.8)',
						borderRadius: 3,
						barPercentage: 0.7
					},
					{
						label: 'Incorrect',
						data: data.incorrect,
						backgroundColor: 'rgba(239, 68, 68, 0.8)',
						borderRadius: 3,
						barPercentage: 0.7
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: true,
						position: 'bottom',
						labels: {
							boxWidth: 12,
							padding: 16,
							font: { size: 12, weight: 'bold' }
						}
					}
				},
				scales: {
					x: {
						stacked: true,
						grid: { display: false },
						ticks: {
							font: { size: 10 },
							maxRotation: 0,
							autoSkip: true,
							maxTicksLimit: activePeriod === 'hourly' ? 12 : 15
						}
					},
					y: {
						stacked: true,
						beginAtZero: true,
						grid: { color: 'rgba(0, 0, 0, 0.05)' },
						ticks: {
							font: { size: 11 },
							stepSize: 1,
							precision: 0
						}
					}
				}
			}
		});
	}

	function switchPeriod(p: 'hourly' | 'daily') {
		activePeriod = p;
		fetchData(p);
	}

	$effect(() => {
		if (canvas) {
			fetchData(activePeriod);
		}
		return () => {
			if (chart) chart.destroy();
		};
	});
</script>

<div class="review-chart">
	<div class="review-chart__header">
		<h3 class="review-chart__title">Review History</h3>
		<div class="review-chart__tabs">
			<button
				class="review-chart__tab {activePeriod === 'hourly' ? 'review-chart__tab--active' : ''}"
				onclick={() => switchPeriod('hourly')}
			>
				Hourly
			</button>
			<button
				class="review-chart__tab {activePeriod === 'daily' ? 'review-chart__tab--active' : ''}"
				onclick={() => switchPeriod('daily')}
			>
				Daily
			</button>
		</div>
	</div>
	<div class="review-chart__canvas" style="position: relative; height: 200px;">
		{#if loading}
			<div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 0.85rem;">
				Loading...
			</div>
		{/if}
		<canvas bind:this={canvas}></canvas>
	</div>
</div>
