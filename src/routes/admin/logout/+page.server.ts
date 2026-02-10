import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
  cookies.delete('admin_session', { path: '/' });
  throw redirect(303, '/admin/login');
};
