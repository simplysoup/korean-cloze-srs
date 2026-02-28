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

	/* Dropdown state — only one open at a time */
	let openMenu = $state<string | null>(null);

	function toggleMenu(name: string) {
		openMenu = openMenu === name ? null : name;
	}

	function closeMenus() {
		openMenu = null;
	}
</script>

<svelte:window onclick={closeMenus} />

{#if data.user}
	<header class="header">
		<nav class="header__inner">
			<!-- Brand -->
			<a class="header__brand" href="/dashboard">
				<span class="header__brand-icon">한</span>
				<span class="header__brand-text">Korean Cloze</span>
			</a>

			<!-- Main nav links -->
			<ul class="header__nav">
				<li>
					{#if data.primaryLearnDeckId && data.learnableCount > 0}
						<a href="/learn?deck_id={data.primaryLearnDeckId}" class="header__nav-btn header__nav-btn--learn">
							<span class="header__nav-label">Learn</span>
							<span class="header__badge header__badge--learn">{data.learnableCount}</span>
						</a>
					{:else}
						<a href="/decks" class="header__nav-btn header__nav-btn--learn">
							<span class="header__nav-label">Learn</span>
						</a>
					{/if}
				</li>
				<li>
					<a href="/reviews" class="header__nav-btn">
						<span class="header__nav-label">Review</span>
						<span class="header__badge header__badge--accent">{data.reviewsDue}</span>
					</a>
				</li>
				<li class="header__dropdown">
					<button
						class="header__nav-btn"
						aria-haspopup="menu"
						aria-expanded={openMenu === 'content'}
						onclick={(e) => { e.stopPropagation(); toggleMenu('content'); }}
					>
						<span class="header__nav-label">Content</span>
						<svg class="header__chevron" viewBox="0 0 24 24" aria-hidden="true">
							<path fill="currentColor" d="m8.71 11.71 2.59 2.59c.39.39 1.02.39 1.41 0l2.59-2.59c.63-.63.18-1.71-.71-1.71H9.41c-.89 0-1.33 1.08-.7 1.71" />
						</svg>
					</button>
					{#if openMenu === 'content'}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div class="header__menu" role="menu" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => { if (e.key === 'Escape') closeMenus(); }}>
							<a href="/grammar" class="header__menu-item" role="menuitem">Grammar Library</a>
							<a href="/decks" class="header__menu-item" role="menuitem">Decks</a>
							{#each data.enrolledDeckSlugs as deck}
								<a href="/decks/{deck.slug}" class="header__menu-item header__menu-item--sub" role="menuitem">{deck.title}</a>
							{/each}
							<a href="/" class="header__menu-item header__menu-item--disabled" role="menuitem">Vocabulary (soon)</a>
						</div>
					{/if}
				</li>
				<li class="header__dropdown">
					<button
						class="header__nav-btn"
						aria-haspopup="menu"
						aria-expanded={openMenu === 'practice'}
						onclick={(e) => { e.stopPropagation(); toggleMenu('practice'); }}
					>
						<span class="header__nav-label">Practice</span>
						<svg class="header__chevron" viewBox="0 0 24 24" aria-hidden="true">
							<path fill="currentColor" d="m8.71 11.71 2.59 2.59c.39.39 1.02.39 1.41 0l2.59-2.59c.63-.63.18-1.71-.71-1.71H9.41c-.89 0-1.33 1.08-.7 1.71" />
						</svg>
					</button>
					{#if openMenu === 'practice'}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div class="header__menu" role="menu" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => { if (e.key === 'Escape') closeMenus(); }}>
							<a href="/reviews" class="header__menu-item" role="menuitem">Cloze Reviews</a>
							<a href="/reviews/roman-to-hangul" class="header__menu-item" role="menuitem">Roman → Hangul</a>
						</div>
					{/if}
				</li>
			</ul>

			<!-- Right section: user profile + utility icons -->
			<div class="header__right">
				<!-- Utility icons -->
				<div class="header__icons">
					<button class="header__icon-btn" title="Notifications" aria-label="Notifications">
						<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2m6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-1.29 1.29c-.63.63-.19 1.71.7 1.71h13.17c.89 0 1.34-1.08.71-1.71z" /></svg>
					</button>
					<a class="header__icon-btn" href="/" title="Search" aria-label="Search">
						<svg viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0s.41-1.08 0-1.49zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14" /></svg>
					</a>
					<a class="header__icon-btn" href="/" title="Help" aria-label="Help">
						<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m-1-4h2v2h-2zm1.61-9.96c-2.06-.3-3.88.97-4.43 2.79-.18.58.26 1.17.87 1.17h.2c.41 0 .74-.29.88-.67.32-.89 1.27-1.5 2.3-1.28.95.2 1.65 1.13 1.57 2.1-.1 1.34-1.62 1.63-2.45 2.88 0 .01-.01.01-.01.02-.01.02-.02.03-.03.05-.09.15-.18.32-.25.5-.01.03-.03.05-.04.08-.01.02-.01.04-.02.07-.12.34-.2.75-.2 1.25h2c0-.42.11-.77.28-1.07.02-.03.03-.06.05-.09.08-.14.18-.27.28-.39.01-.01.02-.03.03-.04.1-.12.21-.23.33-.34.96-.91 2.26-1.65 1.99-3.56-.24-1.74-1.61-3.21-3.35-3.47" /></svg>
					</a>
				</div>

				<!-- User profile chip -->
				<div class="header__dropdown">
					<button
						class="header__profile"
						aria-haspopup="menu"
						aria-expanded={openMenu === 'user'}
						onclick={(e) => { e.stopPropagation(); toggleMenu('user'); }}
					>
						<span class="header__avatar">{(data.user.name ?? data.user.email)[0].toUpperCase()}</span>
						<div class="header__profile-info">
							<span class="header__username">{data.user.name ?? data.user.email}</span>
							<span class="header__level-label">Lv.&nbsp;{data.levelInfo.level}</span>
							<div class="header__xp-bar">
								<div class="header__xp-fill" style="width: {data.levelInfo.progress}%"></div>
							</div>
						</div>
					</button>
					{#if openMenu === 'user'}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div class="header__menu header__menu--right" role="menu" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => { if (e.key === 'Escape') closeMenus(); }}>
							<div class="header__menu-header">
								<span class="header__menu-username">{data.user.name ?? data.user.email}</span>
								<span class="header__menu-xp">Lv. {data.levelInfo.level} — {data.levelInfo.currentXP} / {data.levelInfo.xpForNextLevel} XP</span>
							</div>
							<a href="/" class="header__menu-item" role="menuitem">Profile</a>
							<a href="/" class="header__menu-item" role="menuitem">Settings</a>
							<button class="header__menu-item header__menu-item--danger" role="menuitem" onclick={handleLogout}>Logout</button>
						</div>
					{/if}
				</div>
			</div>
		</nav>
	</header>
{/if}

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


