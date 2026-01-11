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
    try {
      const response = await fetch(IRCC_JSON_URL, {
        headers: {
          'User-Agent': 'MapleMetrics/1.0 (Cloudflare Worker)',
          'Accept': 'application/json'
        },
      });
      if (!response.ok) {
        console.error(`Upstream IRCC Error: ${response.status} ${response.statusText}`);
        return bad(c, `Failed to fetch from IRCC: ${response.statusText}`);
      }
      const data = await response.json();
      return ok(c, data);
    } catch (error) {
      console.error('IRCC Proxy Exception:', error);
      return bad(c, 'Internal error proxying IRCC data');
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
  app.post('/api/chats', async (c) => {
    const { title } = (await c.req.json()) as { title?: string };
    if (!title?.trim()) return bad(c, 'title required');
    const created = await ChatBoardEntity.create(c.env, { id: crypto.randomUUID(), title: title.trim(), messages: [] });
    return ok(c, { id: created.id, title: created.title });
  });
  // MESSAGES
  app.get('/api/chats/:chatId/messages', async (c) => {
    const chat = new ChatBoardEntity(c.env, c.req.param('chatId'));
    if (!await chat.exists()) return notFound(c, 'chat not found');
    return ok(c, await chat.listMessages());
  });
  app.post('/api/chats/:chatId/messages', async (c) => {
    const chatId = c.req.param('chatId');
    const { userId, text } = (await c.req.json()) as { userId?: string; text?: string };
    if (!isStr(userId) || !text?.trim()) return bad(c, 'userId and text required');
    const chat = new ChatBoardEntity(c.env, chatId);
    if (!await chat.exists()) return notFound(c, 'chat not found');
    return ok(c, await chat.sendMessage(userId, text.trim()));
  });
  // DELETE
  app.delete('/api/users/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await UserEntity.delete(c.env, c.req.param('id')) }));
  app.delete('/api/chats/:id', async (c) => ok(c, { id: c.req.param('id'), deleted: await ChatBoardEntity.delete(c.env, c.req.param('id')) }));
  // CRS PROFILES
  app.get('/api/profiles', async (c) => {
    const cq = c.req.query('cursor');
    const lq = c.req.query('limit');
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
}