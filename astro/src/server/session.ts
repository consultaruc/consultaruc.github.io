import crypto from 'node:crypto';
import type { APIContext } from 'astro';

// In-memory replacement for express-session's default MemoryStore -
// deliberately kept in-process (not Redis/a DB) to match the app's existing
// single-PM2-fork deployment model (see ecosystem.config.js). A process
// restart clearing all sessions is accepted, pre-existing behavior, not a
// migration regression - the original app had the exact same property.
const COOKIE_NAME = 'sid';
const MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8h, matches the original session cookie

export interface SessionData {
  apiToken?: string;
  isAdmin?: boolean;
}

interface StoredSession {
  data: SessionData;
  expiresAt: number;
}

const store = new Map<string, StoredSession>();

export interface Session {
  id: string;
  data: SessionData;
  /** true when this session hasn't been persisted to the store yet (mirrors
   * express-session's saveUninitialized:false - a session that nothing has
   * written to never gets a Set-Cookie sent). */
  isNew: boolean;
}

function newId() {
  return crypto.randomBytes(24).toString('hex');
}

function isProd() {
  return process.env.NODE_ENV === 'production';
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: isProd(),
    maxAge: MAX_AGE_MS / 1000,
    path: '/'
  };
}

/** Reads the session for this request, creating an (unpersisted) one if
 * there's no valid 'sid' cookie or it's expired/unknown. */
export function getSession(context: APIContext): Session {
  const cookie = context.cookies.get(COOKIE_NAME);
  const id = cookie?.value;
  if (id) {
    const stored = store.get(id);
    if (stored && stored.expiresAt > Date.now()) {
      return { id, data: stored.data, isNew: false };
    }
    if (stored) store.delete(id); // expired - clean up lazily
  }
  return { id: newId(), data: {}, isNew: true };
}

/** Persists the session and (re)issues the cookie. Call after writing to
 * session.data - mirrors express-session only sending Set-Cookie once
 * something is actually stored (saveUninitialized:false). */
export function saveSession(context: APIContext, session: Session) {
  store.set(session.id, { data: session.data, expiresAt: Date.now() + MAX_AGE_MS });
  context.cookies.set(COOKIE_NAME, session.id, cookieOptions());
}

/** Issues a brand-new session id carrying the same data and drops the old
 * one - defends against session fixation on login, exactly like the
 * original's req.session.regenerate(). */
export function regenerateSession(context: APIContext, session: Session): Session {
  store.delete(session.id);
  const fresh: Session = { id: newId(), data: { ...session.data }, isNew: false };
  saveSession(context, fresh);
  return fresh;
}

export function destroySession(context: APIContext, session: Session) {
  store.delete(session.id);
  context.cookies.delete(COOKIE_NAME, { path: '/' });
}
