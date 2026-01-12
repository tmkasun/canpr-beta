import { Hono } from "hono";
import type { Env } from './core-utils';
import { UserEntity, ChatBoardEntity, CRSProfileEntity } from "./entities";
import { ok, bad, notFound, isStr } from './core-utils';
import { CRSProfile } from "@shared/types";
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.get('/api/test', (c) => c.json({ success: true, data: { name: 'CF Workers Demo' }}));
  // PROXIED IRCC DATA (Bypasses CORS)
  app.get('/api/ircc-data', async (c) => {
    const IRCC_JSON_URL = "https://www.canada.ca/content/dam/ircc/documents/json/ee_rounds_123_en.json";
    // Set a timeout signal for the upstream fetch to avoid hanging worker
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(IRCC_JSON_URL, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'MapleMetrics/1.0 (Cloudflare Worker; +https://maplemetrics.ca)',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        console.error(`[IRCC PROXY] Upstream failure: ${response.status} ${response.statusText}`);
        // Return descriptive status to client
        return c.json({ 
          success: false, 
          error: `IRCC Gateway responded with ${response.status}`,
          status: response.status 
        }, 502);
      }
      const data = await response.json();
      return ok(c, data);
    } catch (error) {
      clearTimeout(timeoutId);
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      console.error(`[IRCC PROXY] ${isTimeout ? 'Timeout' : 'Exception'}:`, error);
      return c.json({ 
        success: false, 
        error: isTimeout ? 'Upstream IRCC gateway timed out' : 'Internal error proxying IRCC data',
        detail: error instanceof Error ? error.message : String(error)
      }, isTimeout ? 504 : 500);
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
  // CHATS
  app.get('/api/chats', async (c) => {
    await ChatBoardEntity.ensureSeed(c.env);
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    const page = await ChatBoardEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  // CRS PROFILES
  app.get('/api/profiles', async (c) => {
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
    await CRSProfileEntity.ensureSeed(c.env);
    const page = await CRSProfileEntity.list(c.env, cq ?? null, lq ? Math.max(1, (Number(lq) | 0)) : undefined);
    return ok(c, page);
  });
  app.post('/api/profiles', async (c) => {
    const profile = (await c.req.json()) as CRSProfile;
    if (!profile.id) profile.id = crypto.randomUUID();
    profile.date = new Date().toISOString();
    return ok(c, await CRSProfileEntity.create(c.env, profile));
  });
  app.delete('/api/profiles/:id', async (c) => {
    const id = c.req.param('id');
    return ok(c, { id, deleted: await CRSProfileEntity.delete(c.env, id) });
  });
  app.delete('/api/users/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await UserEntity.delete(c.env, c.req.param('id')) }));
}