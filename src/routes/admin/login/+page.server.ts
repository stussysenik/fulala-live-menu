import type { Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const password = data.get('password')?.toString() ?? '';

    const correctPassword = process.env.ADMIN_PASSWORD ?? 'fulala2026';

    if (password !== correctPassword) {
      return fail(400, { error: 'Invalid password' });
    }

    // Create session token: timestamp:hash
    const timestamp = Date.now();
    const tokenData = `${timestamp}:${correctPassword}`;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(tokenData));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const sessionToken = `${timestamp}:${hash}`;

    cookies.set('admin_session', sessionToken, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    throw redirect(303, '/admin');
  },
};
