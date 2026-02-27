import { auth } from '$lib/server/auth';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { redirect } from '@sveltejs/kit';

/** Paths that don't require authentication */
const PUBLIC_PATHS = ['/login', '/api/auth'];

/** Exact paths that don't require authentication */
const PUBLIC_EXACT = ['/'];

export async function handle({ event, resolve }) {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (session) {
		event.locals.session = session.session;
		event.locals.user = session.user;
	}

	// Auth guard: redirect unauthenticated users to /login (or 401 for API routes)
	const { pathname } = event.url;
	const isPublic = PUBLIC_EXACT.includes(pathname) || PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));

	if (!session && !isPublic) {
		// API routes should get a JSON 401, not a redirect
		if (pathname.startsWith('/api/')) {
			return new Response(JSON.stringify({ error: 'Unauthorized' }), {
				status: 401,
				headers: { 'Content-Type': 'application/json' }
			});
		}
		redirect(302, '/login');
	}

	const response = await svelteKitHandler({ event, resolve, auth, building });

	// Prevent browsers from serving stale authenticated pages from cache.
	// Normal SvelteKit client-side navigation stays instant; only full
	// page loads (including Ctrl-Shift-R) will re-validate with the server.
	if (session && !pathname.startsWith('/api/')) {
		response.headers.set('Cache-Control', 'private, no-store, must-revalidate');
	}

	return response;
}
