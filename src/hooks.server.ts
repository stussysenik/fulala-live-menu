import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Protect /admin routes (except /admin/login)
  if (event.url.pathname.startsWith('/admin') && !event.url.pathname.startsWith('/admin/login')) {
    const sessionToken = event.cookies.get('admin_session');

    if (!sessionToken) {
      throw redirect(303, '/admin/login');
    }

    // Validate the session token
    const isValid = await validateSession(sessionToken);
    if (!isValid) {
      event.cookies.delete('admin_session', { path: '/' });
      throw redirect(303, '/admin/login');
    }
  }

  return resolve(event);
};

async function validateSession(token: string): Promise<boolean> {
  // Token format: timestamp:hash
  const parts = token.split(':');
  if (parts.length !== 2) return false;

  const timestamp = parseInt(parts[0], 10);
  if (isNaN(timestamp)) return false;

  // Sessions expire after 24 hours
  const maxAge = 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > maxAge) return false;

  // Verify the hash
  const password = process.env.ADMIN_PASSWORD ?? 'fulala2026';
  const data = `${timestamp}:${password}`;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', keyData);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const expectedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return parts[1] === expectedHash;
}
