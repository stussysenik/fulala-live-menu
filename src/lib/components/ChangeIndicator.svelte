<script lang="ts">
	// Visual indicator for recently changed items
</script>

<span class="change-indicator" aria-label="Recently updated" title="Recently updated">
	<span class="dot"></span>
</span>

<style>
	.change-indicator {
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.dot {
		width: 8px;
		height: 8px;
		background-color: var(--accent);
		border-radius: 50%;
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.6;
			transform: scale(0.85);
		}
	}
</style>
