import { afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { run } from './run.mjs';

const servers = [];
afterEach(async () => {
  await Promise.all(servers.splice(0).map((s) => new Promise((resolve) => s.close(resolve))));
  for (const key of ['SYNC_BASE_URL', 'SYNC_TOKEN_A', 'SYNC_TOKEN_A2', 'SYNC_TOKEN_B', 'SYNC_TOKEN_EXPIRED', 'SYNC_TOKEN_REVOKED']) {
    delete process.env[key];
  }
});

async function fakeServer({ cas = true, preserveUnknown = true } = {}) {
  const states = new Map();
  const identities = { tokenA: 'accountA', tokenA2: 'accountA', tokenB: 'accountB' };
  const server = http.createServer(async (req, res) => {
    const json = (status, body) => {
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(body));
    };
    const token = req.headers.authorization?.replace(/^Bearer /, '');
    const id = identities[token];
    if (!id) return json(401, { ok: false, error: 'unauthorized' });
    const state = states.get(id) || { version: 0, payload: null };
    if (req.url === '/api/sync/pull' && req.method === 'GET') {
      return json(200, { ok: true, version: state.version, updatedAt: null, payload: state.payload });
    }
    if (req.url !== '/api/sync/push' || req.method !== 'POST') return json(404, { ok: false });
    let raw = '';
    for await (const chunk of req) {
      raw += chunk;
      if (raw.length > 2_097_152) return json(413, { ok: false, error: 'too-large' });
    }
    let body;
    try { body = JSON.parse(raw); } catch { return json(400, { ok: false }); }
    const payload = body.payload;
    if (!payload || typeof payload !== 'object' || !Array.isArray(payload.reviewLogs) || !Array.isArray(payload.reviewCards)
      || !Array.isArray(payload.libraryDecks) || !payload.user || !payload.dailyLearned
      || typeof payload.dailyLearned !== 'object') {
      return json(400, { ok: false, error: 'malformed' });
    }
    if (cas && body.expectedVersion !== state.version) {
      return json(409, { ok: false, error: 'conflict', version: state.version });
    }
    const merged = { ...payload };
    if (preserveUnknown && state.payload) {
      for (const [key, value] of Object.entries(state.payload)) {
        if (!(key in merged)) merged[key] = value;
      }
    }
    states.set(id, { version: state.version + 1, payload: merged });
    return json(200, { ok: true, version: state.version + 1 });
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  servers.push(server);
  return `http://127.0.0.1:${server.address().port}`;
}
function configure(url) {
  process.env.SYNC_BASE_URL = url;
  process.env.SYNC_TOKEN_A = 'tokenA';
  process.env.SYNC_TOKEN_A2 = 'tokenA2';
  process.env.SYNC_TOKEN_B = 'tokenB';
  process.env.SYNC_TOKEN_EXPIRED = 'expired';
  process.env.SYNC_TOKEN_REVOKED = 'revoked';
}
const args = ['--mode=all', '--confirm-disposable', '--rounds=4'];

test('reference local fixture passes all online invariants (restart remains unverified)', async () => {
  configure(await fakeServer());
  const result = await run(args);
  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.results.filter((v) => v.status === 'FAIL').length, 0, JSON.stringify(result.results));
  assert.equal(result.results.filter((v) => v.status === 'PASS').length, 10);
  assert.equal(result.results.find((v) => v.name === 'restart-recovery').status, 'BLOCKED');
  assert(!JSON.stringify(result).includes('tokenA'));
});

test('negative control: blind last-writer-wins is rejected', async () => {
  configure(await fakeServer({ cas: false }));
  const result = await run(args);
  assert.equal(result.status, 'FAIL');
  assert.equal(result.results.find((v) => v.name === 'atomic-races-and-bounded-merge').status, 'FAIL');
});

test('negative control: stripping unknown keys is rejected', async () => {
  configure(await fakeServer({ preserveUnknown: false }));
  const result = await run(args);
  assert.equal(result.status, 'FAIL');
  assert.equal(result.results.find((v) => v.name === 'legacy-client-preserves-future-fields').status, 'FAIL');
});

test('fails closed without disposable-account assertion', async () => {
  configure(await fakeServer());
  const result = await run(['--mode=all']);
  assert.equal(result.status, 'BLOCKED');
  assert.equal(result.results[0].name, 'configuration');
});

test('refuses unapproved nonlocal host even with disclaimer', async () => {
  configure('https://example.com');
  const result = await run(args);
  assert.equal(result.status, 'BLOCKED');
  assert.match(result.results[0].detail, /allow-staging-origin/);
});
