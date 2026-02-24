<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import '../app.css';

	let { data, children } = $props();

	async function handleLogout() {
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => {
					window.location.href = '/login';
				}
			}
		});
	}
</script>

<nav class="nav-bar">
	<a href="/" class="nav-brand">Korean Cloze SRS</a>
	<div class="nav-links">
		{#if data.user}
			<a href="/reviews" class="nav-link">Reviews</a>
			<span class="nav-user">{data.user.name ?? data.user.email}</span>
			<button class="btn btn--secondary btn--sm" onclick={handleLogout}>Logout</button>
		{:else}
			<a href="/login" class="nav-link">Login</a>
		{/if}
	</div>
</nav>

{@render children()}

<footer class="roman-guide">
	<details>
		<summary>Romanization reference</summary>
		<table>
			<thead>
				<tr><th>Roman</th><th>Jamo</th><th>Roman</th><th>Jamo</th></tr>
			</thead>
			<tbody>
				<tr><td>a</td><td>ㅏ</td><td>ya</td><td>ㅑ</td></tr>
				<tr><td>ae</td><td>ㅐ</td><td>yae</td><td>ㅒ</td></tr>
				<tr><td>eo</td><td>ㅓ</td><td>yeo</td><td>ㅕ</td></tr>
				<tr><td>e</td><td>ㅔ</td><td>ye</td><td>ㅖ</td></tr>
				<tr><td>o</td><td>ㅗ</td><td>yo</td><td>ㅛ</td></tr>
				<tr><td>wa</td><td>ㅘ</td><td>wae</td><td>ㅙ</td></tr>
				<tr><td>oe</td><td>ㅚ</td><td>u</td><td>ㅜ</td></tr>
				<tr><td>weo</td><td>ㅝ</td><td>we</td><td>ㅞ</td></tr>
				<tr><td>wi</td><td>ㅟ</td><td>eu</td><td>ㅡ</td></tr>
				<tr><td>ui</td><td>ㅢ</td><td>i</td><td>ㅣ</td></tr>
				<tr><td>yu</td><td>ㅠ</td><td>—</td><td>—</td></tr>
				<tr><td colspan="4" class="section">Consonants</td></tr>
				<tr><td>g</td><td>ㄱ</td><td>gg</td><td>ㄲ</td></tr>
				<tr><td>n</td><td>ㄴ</td><td>d</td><td>ㄷ</td></tr>
				<tr><td>dd</td><td>ㄸ</td><td>r / l</td><td>ㄹ</td></tr>
				<tr><td>m</td><td>ㅁ</td><td>b</td><td>ㅂ</td></tr>
				<tr><td>bb</td><td>ㅃ</td><td>s</td><td>ㅅ</td></tr>
				<tr><td>ss</td><td>ㅆ</td><td>ng</td><td>ㅇ</td></tr>
				<tr><td>j</td><td>ㅈ</td><td>jj</td><td>ㅉ</td></tr>
				<tr><td>ch</td><td>ㅊ</td><td>k</td><td>ㅋ</td></tr>
				<tr><td>t</td><td>ㅌ</td><td>p</td><td>ㅍ</td></tr>
				<tr><td>h</td><td>ㅎ</td><td>—</td><td>—</td></tr>
			</tbody>
		</table>
	</details>
</footer>


