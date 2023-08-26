import { Context, Hono } from 'hono';
import { Bindings } from './bindings';
import { shortHashUrl } from './utils';

const app = new Hono<{ Bindings: Bindings }>();

/**
 * This handler either creates a new shortened url or returns the existing one.
 *
 * @param context - The context object of Hono
 *
 * @returns Response - The shortened url
 */
app.get('/', async (c: Context<{ Bindings: Bindings }>) => {
	const url = c.req.query('url');
	const appUrl = c.env.APP_URL;

	if (!url) {
		return c.json({ message: 'url is required' }, { status: 400 });
	}

	const hash = shortHashUrl(url);
	const tinyUrl = await c.env.NANO_URL_MAP.get(hash);

	if (tinyUrl) {
		return c.json({ url: `${appUrl}/${hash}` });
	}

	await c.env.NANO_URL_MAP.put(hash, url);

	return c.json({ url: `${appUrl}/${hash}` });
});

/**
 * This handler redirects the user to the original url.
 *
 * @param context - The context object of Hono
 *
 * @returns Response - Redirect to the original url
 */
app.get('/:key', async (c: Context<{ Bindings: Bindings }>) => {
	const key = c.req.param('key');

	if (!key) {
		return c.json({ message: 'malformed url' }, { status: 400 });
	}

	const url = await c.env.NANO_URL_MAP.get(key);

	if (!url) {
		return c.json({ message: 'url not found' }, { status: 404 });
	}

	return c.redirect(url);
});

export default app;
