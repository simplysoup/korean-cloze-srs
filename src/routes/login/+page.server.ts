import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// Already logged in — send them to the main page
	if (locals.user) {
		redirect(302, '/');
	}
};
