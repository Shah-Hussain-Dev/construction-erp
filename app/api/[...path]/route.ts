import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { can, visible } from '@/lib/domain.cjs';
import { loginSchema, type RecordData, type User } from '@/schemas';
const base = process.env.JSON_SERVER_URL || 'http://127.0.0.1:3001';
const secret = process.env.SESSION_SECRET || 'local-civil-erp-development-only';
const sign = (v: string) => createHmac('sha256', secret).update(v).digest('hex');
async function get(resource: string) {
  const res = await fetch(`${base}/${resource}`, { cache: 'no-store' });
  if (!res.ok) throw Error('The local data server is unavailable. Run pnpm dev.');
  return res.json();
}
async function handler(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  try {
    if (
      req.method !== 'GET' &&
      req.headers.get('origin') &&
      new URL(req.headers.get('origin')!).host !== req.headers.get('host')
    )
      return NextResponse.json({ message: 'Origin not allowed.' }, { status: 403 });
    if (process.env.NEXT_PUBLIC_DATA_SOURCE === 'http') {
      const url = process.env.API_BASE_URL;
      if (!url) throw Error('API_BASE_URL is not configured.');
      const upstream = await fetch(
        `${url}/${path.map(encodeURIComponent).join('/')}${req.nextUrl.search}`,
        {
          method: req.method,
          headers: { 'Content-Type': 'application/json', cookie: req.headers.get('cookie') || '' },
          body: req.method === 'GET' ? undefined : await req.text(),
          cache: 'no-store',
          redirect: 'manual',
        },
      );
      const headers = new Headers({
        'Content-Type': upstream.headers.get('content-type') || 'application/json',
      });
      for (const cookie of upstream.headers.getSetCookie()) headers.append('Set-Cookie', cookie);
      return new NextResponse(await upstream.text(), { status: upstream.status, headers });
    }
    const users: User[] = await get('users');
    if (path.join('/') === 'auth/login' && req.method === 'POST') {
      const input = loginSchema.parse(await req.json());
      const user = users.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
      if (!user || input.password !== 'demo')
        return NextResponse.json(
          { message: 'Use a listed demo email and password “demo”.' },
          { status: 401 },
        );
      const value = `${user.id}.${Date.now() + 86400000}`;
      const response = NextResponse.json(user);
      response.cookies.set('civil-session', `${value}.${sign(value)}`, {
        httpOnly: true,
        sameSite: 'lax',
        secure: req.nextUrl.protocol === 'https:',
        path: '/',
        maxAge: 86400,
      });
      return response;
    }
    if (path.join('/') === 'auth/logout') {
      const response = NextResponse.json({ ok: true });
      response.cookies.delete('civil-session');
      return response;
    }
    if (path.join('/') === 'auth/reset') {
      return NextResponse.json({
        message:
          'Demo mode does not send email. Use password “demo”. Real password reset will use the connected authentication API.',
      });
    }
    const cookie = req.cookies.get('civil-session')?.value || '';
    const [id, expiry, signature] = cookie.split('.');
    const expected = sign(`${id}.${expiry}`);
    const valid =
      signature?.length === expected.length &&
      timingSafeEqual(Buffer.from(signature), Buffer.from(expected)) &&
      Number(expiry) > Date.now();
    const user = valid ? users.find((u) => u.id === id) : undefined;
    if (!user)
      return NextResponse.json(
        { message: 'Your session has expired. Please sign in.' },
        { status: 401 },
      );
    if (path.join('/') === 'auth/me') return NextResponse.json(user);
    if (path[0] === 'command' && req.method === 'POST') {
      const response = await fetch(`${base}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-demo-user': user.id },
        body: await req.text(),
      });
      return NextResponse.json(await response.json(), { status: response.status });
    }
    const resource = path[0];
    if (
      req.method !== 'GET' ||
      !can(user, resource, 'view') ||
      ['operations', 'reset-requests'].includes(resource)
    )
      return NextResponse.json(
        { message: 'You do not have access to this resource.' },
        { status: 403 },
      );
    let rows: RecordData[] = await get(resource);
    if (!Array.isArray(rows)) return NextResponse.json({ message: 'Not found.' }, { status: 404 });
    rows = rows.filter((row) => visible(user, row));
    if (user.role === 'contractor' && resource === 'contractors')
      rows = rows.filter((row) => row.id === user.partyId);
    if (['contractor', 'client'].includes(user.role) && resource === 'notifications')
      rows = rows.filter(
        (row) =>
          row.resource === 'contractor-bills' &&
          (user.role !== 'contractor' || row.contractorId === user.partyId),
      );
    if (resource === 'audit' || resource === 'evidence') {
      const allowed = rows.filter((row) =>
        can(user, String(row.resource || row.recordType), 'view'),
      );
      const resources = [...new Set(allowed.map((row) => String(row.resource || row.recordType)))];
      const lookup = Object.fromEntries(
        await Promise.all(resources.map(async (r) => [r, await get(r)])),
      );
      rows = allowed.filter((row) =>
        lookup[String(row.resource || row.recordType)]?.some(
          (r: RecordData) => r.id === row.recordId && visible(user, r),
        ),
      );
    }
    if (path[1]) {
      const row = rows.find((r) => r.id === path[1]);
      return NextResponse.json(row || { message: 'Record not found.' }, {
        status: row ? 200 : 404,
      });
    }
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Unable to load data.' },
      { status: 400 },
    );
  }
}
export const GET = handler;
export const POST = handler;
