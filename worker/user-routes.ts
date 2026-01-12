import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ChatBoardEntity } from "./entities";
import { ok, bad } from './core-utils';
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/test', (c) => c.json({ success: true, data: { name: 'CF Workers Demo' }}));
  // IRCC Data Proxy to bypass browser CORS
  app.get('/api/ircc-proxy', async (c) => {
    try {
      const IRCC_URL = "https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json";
      const response = await fetch(IRCC_URL, {
        headers: {
          'User-Agent': 'MapleMetrics/1.0 (Cloudflare Worker; Proxy)',
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        return bad(c, `IRCC Gateway Error: ${response.status}`);
      }
      const data = await response.json();
      return c.json(data);
    } catch (err) {
      return bad(c, `Proxy failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  });
  // USERS
  app.get('/api/users', async (c) => {
    await UserEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await UserEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/users', async (c) => {
    const { name } = (await c.req.json()) as { name?: string };
    if (!name?.trim()) return bad(c, 'name required');
    return ok(c, await UserEntity.create(c.env, { id: crypto.randomUUID(), name: name.trim() }));
  });
  app.delete('/api/users/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await UserEntity.delete(c.env, c.req.param('id')) }));
  // CHATS
  app.get('/api/chats', async (c) => {
    await ChatBoardEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await ChatBoardEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
}