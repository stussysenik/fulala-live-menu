import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// Webhook endpoint for Google Sheets sync
// Called by Google Apps Script when sheet is edited

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();

		// Validate webhook secret (optional but recommended)
		const secret = request.headers.get('x-webhook-secret');
		const expectedSecret = import.meta.env.VITE_WEBHOOK_SECRET;

		if (expectedSecret && secret !== expectedSecret) {
			throw error(401, 'Invalid webhook secret');
		}

		// Extract data from webhook payload
		const { categories, menuItems, spreadsheetId } = body;

		if (!categories && !menuItems) {
			throw error(400, 'Missing categories or menuItems in payload');
		}

		// Forward to Convex sync
		// In production, you would call the Convex action here
		// For now, we return the received data for verification

		return json({
			success: true,
			message: 'Sync webhook received',
			received: {
				categoriesCount: categories?.length ?? 0,
				menuItemsCount: menuItems?.length ?? 0,
				spreadsheetId
			}
		});
	} catch (err) {
		console.error('Sync webhook error:', err);

		if (err instanceof Error) {
			throw error(500, err.message);
		}

		throw error(500, 'Unknown error occurred');
	}
};

// Health check endpoint
export const GET: RequestHandler = async () => {
	return json({
		status: 'ok',
		endpoint: 'sync',
		timestamp: new Date().toISOString()
	});
};
