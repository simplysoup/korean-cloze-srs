<script lang="ts">
	import { authClient } from '$lib/auth-client';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);
	let mode = $state<'login' | 'signup'>('login');

	async function handleSubmit() {
		error = '';
		loading = true;
		try {
			if (mode === 'login') {
				const result = await authClient.signIn.email({ email, password });
				if (result.error) {
					error = result.error.message ?? 'Login failed';
				} else {
					window.location.href = '/reviews';
				}
			} else {
				const result = await authClient.signUp.email({
					email,
					password,
					name: email.split('@')[0]
				});
				if (result.error) {
					error = result.error.message ?? 'Sign up failed';
				} else {
					window.location.href = '/reviews';
				}
			}
		} catch (e) {
			error = 'An unexpected error occurred';
		} finally {
			loading = false;
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') handleSubmit();
	}
</script>

<div class="login-wrapper">
	<div class="login-card">
		<h1 class="login-title">{mode === 'login' ? 'Login' : 'Sign Up'}</h1>

		{#if error}
			<div class="login-error">{error}</div>
		{/if}

		<div class="login-fields">
			<label for="email" class="field-label">Email</label>
			<input
				id="email"
				type="email"
				class="roman-input"
				bind:value={email}
				onkeydown={handleKeydown}
				placeholder="test@example.com"
				autocomplete="email"
			/>

			<label for="password" class="field-label">Password</label>
			<input
				id="password"
				type="password"
				class="roman-input"
				bind:value={password}
				onkeydown={handleKeydown}
				placeholder="Password"
				autocomplete={mode === 'login' ? 'current-password' : 'new-password'}
			/>
		</div>

		<button
			class="btn btn--primary btn--full"
			onclick={handleSubmit}
			disabled={loading || !email || !password}
		>
			{#if loading}
				{mode === 'login' ? 'Logging in…' : 'Signing up…'}
			{:else}
				{mode === 'login' ? 'Login' : 'Sign Up'}
			{/if}
		</button>

		<p class="login-switch">
			{#if mode === 'login'}
				Don't have an account?
				<button class="link-btn" onclick={() => (mode = 'signup')}>Sign up</button>
			{:else}
				Already have an account?
				<button class="link-btn" onclick={() => (mode = 'login')}>Login</button>
			{/if}
		</p>
	</div>
</div>

<style>
	.login-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: calc(100vh - 6rem);
		padding: 1rem;
	}

	.login-card {
		width: 100%;
		max-width: 380px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.login-title {
		text-align: center;
		font-size: 1.5rem;
		margin: 0;
		color: var(--text);
	}

	.login-error {
		background: var(--red-bg);
		color: var(--red-text);
		border: 1px solid var(--red-border);
		border-radius: var(--radius-sm);
		padding: 0.5rem 0.75rem;
		font-size: 0.85rem;
	}

	.login-fields {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	:global(.btn--full) {
		width: 100%;
	}

	.login-switch {
		text-align: center;
		font-size: 0.85rem;
		color: var(--text-muted);
		margin: 0;
	}

	.link-btn {
		background: none;
		border: none;
		color: var(--blue);
		cursor: pointer;
		padding: 0;
		font-size: inherit;
		font-family: inherit;
		text-decoration: underline;
	}

	.link-btn:hover {
		color: var(--blue-dark);
	}
</style>
