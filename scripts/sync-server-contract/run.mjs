#!/usr/bin/env node
/**
 * Agent 09: opt-in, destructive-to-DISPOSABLE-ACCOUNTS black-box sync audit.
 * No external packages, production host access, or credentials in logs.
 * This is NOT proof about the real backend until run against an authorized
 * local/staging instance with genuinely separate disposable device sessions.
 */
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';

const CHECKS = [
  'empty-disposable-accounts',
  'unauthenticated-rejected',
  'future-fields-roundtrip',
  'legacy-client-preserves-future-fields',
  'atomic-races-and-bounded-merge',
  'duplicate-stale-retry',
  'offline-device-merge',
  'cross-account-isolation',
  'schema-and-size-rejection',
  'expired-and-revoked-tokens',
  'restart-recovery',
];
const FIELDS_OLD_CLIENT = [
  'version', 'updatedAt', 'user', 'reviewCards', 'reviewLogs',
  'libraryDecks', 'streak', 'settings', 'dailyLearned',
];
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = (value) => structuredClone(value);
const now = () => new Date().toISOString();
const assert = (condition, message) => { if (!condition) throw Error(message); };
const isSuccess = (r) => r.status >= 200 && r.status < 300 && r.json?.ok === true;
const isConflict = (r) => [409, 412].includes(r.status) && r.json?.ok !== true;
const isRejected = (r) => r.status >= 400 && r.json?.ok !== true;
const logIds = (doc) => (doc?.reviewLogs || []).map((v) => v.id);
const vocabIds = (doc) => (doc?.vocabularyProgress?.events || []).map((v) => v.id);
const contains = (ids, expected) => expected.every((id) => ids.includes(id));
const sameArrayMembers = (a, b) => a.length === b.length && new Set(a).size === a.length && a.every((x) => b.includes(x));
const uid = (prefix) => `agent09-${prefix}-${randomUUID()}`;

function options(argv) {
  const flags = Object.fromEntries(argv.filter((s) => s.startsWith('--')).map((s) => {
    const [key, ...value] = s.slice(2).split('=');
    return [key, value.length ? value.join('=') : true];
  }));
  const mode = flags.mode || 'all';
  assert(['all', 'recovery-check'].includes(mode), 'Choose --mode=all or --mode=recovery-check');
  const base = flags.url || process.env.SYNC_BASE_URL;
  assert(base, 'SYNC_BASE_URL or --url is required (no default production endpoint)');
  const url = new URL(base);
  assert(['http:', 'https:'].includes(url.protocol), 'Only http/https URL allowed');
  assert(!url.username && !url.password && !url.search && !url.hash, 'URL must not include secrets, query or fragment');
  assert(!url.pathname || url.pathname === '/', 'URL must be an origin only, with no path');
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (!local) {
    assert(url.protocol === 'https:', 'Non-local testing requires HTTPS');
    assert(flags['allow-staging-origin'] === url.origin, 'Non-local testing requires exact --allow-staging-origin=HTTPS_ORIGIN');
  }
  assert(flags['confirm-disposable'] === true, 'Required: --confirm-disposable (mutates only test accounts)');
  const expectedField = flags['precondition-field'] || 'expectedVersion';
  assert(['expectedVersion', 'baseVersion', 'version'].includes(expectedField), 'Invalid --precondition-field');
  const rounds = Number(flags.rounds || 4);
  assert(Number.isInteger(rounds) && rounds >= 3 && rounds <= 30, '--rounds must be 3..30');
  const tokens = {
    a: process.env.SYNC_TOKEN_A,
    a2: process.env.SYNC_TOKEN_A2,
    b: process.env.SYNC_TOKEN_B,
    expired: process.env.SYNC_TOKEN_EXPIRED,
    revoked: process.env.SYNC_TOKEN_REVOKED,
  };
  assert(tokens.a, 'Missing SYNC_TOKEN_A');
  if (mode === 'all') {
    assert(tokens.a2 && tokens.b, 'Both SYNC_TOKEN_A2 (same user) and SYNC_TOKEN_B (different user) are required');
    assert(new Set([tokens.a, tokens.a2, tokens.b]).size === 3, 'Three distinct session tokens required');
  }
  return { mode, url: url.origin, expectedField, rounds, tokens, checkpoint: flags.checkpoint || null };
}

async function request(config, method, route, token = null, body = undefined) {
  let response;
  try {
    response = await fetch(`${config.url}${route}`, {
      method,
      headers: {
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(12000),
    });
  } catch (error) {
    // Never echo fetch errors/URL headers, which could contain local credentials.
    throw Error(`Network failure at ${method} ${route} (${error?.name || 'unknown'})`);
  }
  let json = null;
  try { json = await response.json(); } catch { /* Non-JSON responses are a contract failure. */ }
  return { status: response.status, json };
}

const pull = (config, token) => request(config, 'GET', '/api/sync/pull', token);
const push = (config, token, doc, expectedVersion) => request(config, 'POST', '/api/sync/push', token, {
  [config.expectedField]: expectedVersion,
  updatedAt: doc.updatedAt,
  payload: doc,
});

function docFixture(runId) {
  return {
    version: 0,
    updatedAt: now(),
    user: { username: 'agent09-disposable', email: 'agent09-disposable@example.invalid' },
    reviewCards: [],
    reviewLogs: [],
    libraryDecks: [],
    streak: null,
    settings: null,
    dailyLearned: {},
    vocabularyProgress: { schemaVersion: 1, events: [] },
    agent09ForwardCompatibility: { runId, probe: 'unknown-top-level-key' },
  };
}
function appendEvents(doc, runId, suffix) {
  const out = clone(doc);
  out.updatedAt = now();
  out.reviewLogs.push({
    id: `${runId}:grammar:${suffix}`,
    grammarPointId: process.env.SYNC_TEST_GRAMMAR_POINT_ID || 'agent09-synthetic-grammar',
    rating: 3, reviewedAt: now(), stability: 1.2, difficulty: 3.1,
    elapsedDays: 1, scheduledDays: 2,
  });
  // Synthetic equivalent of future vocabulary progress. Immutable event IDs
  // are deliberately distinct from grammarPointId and grammar review log IDs.
  out.vocabularyProgress ??= { schemaVersion: 1, events: [] };
  out.vocabularyProgress.events.push({
    id: `${runId}:vocab:${suffix}`,
    vocabularyEntryId: 'agent09-synthetic-vocabulary',
    rating: 'good', reviewedAt: now(),
  });
  return out;
}
function mergeUnion(server, offline) {
  const result = clone(server);
  const seenLogIds = new Set(logIds(result));
  for (const log of offline.reviewLogs) {
    if (!seenLogIds.has(log.id)) { result.reviewLogs.push(clone(log)); seenLogIds.add(log.id); }
  }
  const seenVocabIds = new Set(vocabIds(result));
  result.vocabularyProgress ??= { schemaVersion: 1, events: [] };
  for (const event of offline.vocabularyProgress?.events || []) {
    if (!seenVocabIds.has(event.id)) {
      result.vocabularyProgress.events.push(clone(event));
      seenVocabIds.add(event.id);
    }
  }
  result.updatedAt = now();
  return result;
}
function assertSnapshot(snapshot, ids, vocab, message) {
  assert(isSuccess(snapshot) && snapshot.json?.payload && Number.isSafeInteger(snapshot.json.version), `${message}: invalid pull response`);
  const actual = snapshot.json.payload;
  assert(contains(logIds(actual), ids), `${message}: missing immutable grammar review log(s)`);
  assert(contains(vocabIds(actual), vocab), `${message}: missing vocabulary progress event(s)`);
  assert(new Set(logIds(actual)).size === logIds(actual).length, `${message}: duplicated grammar review log IDs`);
  assert(new Set(vocabIds(actual)).size === vocabIds(actual).length, `${message}: duplicated vocabulary event IDs`);
}
function record(name, status, detail) { return { name, status, detail }; }
function redacted(r) {
  // Never print payload, email, token, request body or server message.
  return {
    status: r.status,
    ok: r.json?.ok === true,
    version: Number.isSafeInteger(r.json?.version) ? r.json.version : null,
    payloadKeys: r.json?.payload && typeof r.json.payload === 'object' ? Object.keys(r.json.payload).sort() : [],
    reviewCount: logIds(r.json?.payload).length,
    vocabularyCount: vocabIds(r.json?.payload).length,
  };
}

async function runFull(config, results, evidence) {
  const runId = uid('run');
  let latest;
  const addEvidence = (label, response) => evidence.push({ label, ...redacted(response) });
  // Stop on a failed destructive gate rather than running later writes against
  // a potentially incorrect server. Unreached checks are BLOCKED.
  async function check(name, action) {
    try {
      const detail = await action();
      results.push(record(name, 'PASS', detail));
    } catch (error) {
      results.push(record(name, 'FAIL', error.message));
      throw error;
    }
  }

  await check('empty-disposable-accounts', async () => {
    const responses = await Promise.all([pull(config, config.tokens.a), pull(config, config.tokens.a2), pull(config, config.tokens.b)]);
    for (const [index, response] of responses.entries()) {
      addEvidence(`initial-pull-${index + 1}`, response);
      assert(isSuccess(response) && response.json.version === 0 && response.json.payload == null,
        `Account session ${index + 1} is not a fresh empty disposable account; refusing writes`);
    }
    return 'Three distinct disposable sessions start with empty v0 snapshots';
  });
  await check('unauthenticated-rejected', async () => {
    const r = await pull(config, null);
    addEvidence('unauthenticated-pull', r);
    assert(isRejected(r) && [401, 403].includes(r.status), 'Unauthenticated pull was not rejected with 401/403');
    return 'Missing token cannot pull';
  });
  await check('future-fields-roundtrip', async () => {
    const seed = appendEvents(docFixture(runId), runId, 'seed');
    const pushed = await push(config, config.tokens.a, seed, 0);
    addEvidence('seed-push', pushed);
    assert(isSuccess(pushed) && pushed.json.version === 1, 'Initial push must commit as server v1');
    const verified = await pull(config, config.tokens.a2);
    addEvidence('second-device-pull', verified);
    assertSnapshot(verified, logIds(seed), vocabIds(seed), 'Initial unknown-field roundtrip');
    assert(verified.json.payload.agent09ForwardCompatibility?.runId === runId,
      'Unknown top-level namespace was stripped on push/pull');
    latest = verified;
    return 'Device 2 reads vocabularyProgress and future unknown namespace after push';
  });
  await check('legacy-client-preserves-future-fields', async () => {
    // Exact behavior of existing full-snapshot grammar-only clients: they do
    // NOT echo unknown top-level fields. A server may reject such a write,
    // but must NEVER silently remove the previously stored extension.
    const legacy = Object.fromEntries(FIELDS_OLD_CLIENT.map((k) => [k, clone(latest.json.payload[k])]));
    legacy.reviewLogs.push({
      id: `${runId}:grammar:legacy`,
      grammarPointId: process.env.SYNC_TEST_GRAMMAR_POINT_ID || 'agent09-synthetic-grammar',
      rating: 3, reviewedAt: now(), stability: 1.2, difficulty: 3.1,
      elapsedDays: 1, scheduledDays: 2,
    });
    legacy.updatedAt = now();
    const r = await push(config, config.tokens.a, legacy, latest.json.version);
    addEvidence('legacy-write', r);
    assert(isSuccess(r) || isRejected(r), 'Unclassifiable legacy write response');
    const after = await pull(config, config.tokens.a2);
    addEvidence('legacy-followup-pull', after);
    assertSnapshot(after, logIds(latest.json.payload), vocabIds(latest.json.payload), 'Legacy client');
    assert(after.json.payload.agent09ForwardCompatibility?.runId === runId,
      'Old grammar-only client silently deleted unknown JSON fields');
    if (isSuccess(r)) {
      assert(logIds(after.json.payload).includes(`${runId}:grammar:legacy`), 'Legacy push acknowledged but new grammar log was lost');
    } else {
      assert(!logIds(after.json.payload).includes(`${runId}:grammar:legacy`), 'Rejected legacy write partially committed');
    }
    latest = after;
    return isSuccess(r) ? 'Legacy write merged without dropping vocabulary and future namespace' : 'Legacy write explicitly rejected without mutating snapshot';
  });

  let duplicateProbe = null;
  await check('atomic-races-and-bounded-merge', async () => {
    const trace = [];
    for (let i = 0; i < config.rounds; i++) {
      const baseA = await pull(config, config.tokens.a);
      const baseB = await pull(config, config.tokens.a2);
      assert(isSuccess(baseA) && isSuccess(baseB) && baseA.json.version === baseB.json.version,
        `Race ${i}: devices did not pull matching versions`);
      const base = baseA.json.version;
      const a = appendEvents(baseA.json.payload, runId, `race${i}-A`);
      const b = appendEvents(baseB.json.payload, runId, `race${i}-B`);
      // First race is simultaneous; subsequent rounds deliberately reorder.
      const waitA = i === 0 ? 0 : i % 2 ? 20 : 0;
      const waitB = i === 0 ? 0 : i % 2 ? 0 : 20;
      const [ra, rb] = await Promise.all([
        (async () => { await pause(waitA); return push(config, config.tokens.a, a, base); })(),
        (async () => { await pause(waitB); return push(config, config.tokens.a2, b, base); })(),
      ]);
      addEvidence(`race-${i}-A`, ra); addEvidence(`race-${i}-B`, rb);
      const oneWinner = Number(isSuccess(ra)) + Number(isSuccess(rb)) === 1;
      assert(oneWinner && Number(isConflict(ra)) + Number(isConflict(rb)) === 1,
        `Race ${i}: require exactly one CAS success and one HTTP 409/412 conflict`);
      const winner = isSuccess(ra) ? a : b;
      const loser = isSuccess(ra) ? b : a;
      const loserToken = isSuccess(ra) ? config.tokens.a2 : config.tokens.a;
      const committed = await pull(config, loserToken);
      assertSnapshot(committed, logIds(winner), vocabIds(winner), `Race ${i} winner`);
      assert(committed.json.version === base + 1, `Race ${i}: successful push did not atomically increment version`);
      const merged = mergeUnion(committed.json.payload, loser);
      const retry = await push(config, loserToken, merged, committed.json.version);
      addEvidence(`race-${i}-merge-retry`, retry);
      assert(isSuccess(retry) && retry.json.version === base + 2, `Race ${i}: bounded re-pull/merge/retry failed`);
      const final = await pull(config, config.tokens.a);
      assertSnapshot(final, logIds(merged), vocabIds(merged), `Race ${i} merged result`);
      assert(final.json.version === base + 2, `Race ${i}: merged version mismatch`);
      latest = final;
      if (i === 0) duplicateProbe = { doc: winner, expectedVersion: base, token: isSuccess(ra) ? config.tokens.a : config.tokens.a2 };
      trace.push(`round ${i + 1}: v${base}->v${base + 1} + 409/412 ->v${base + 2}`);
    }
    return trace.join('; ');
  });
  await check('duplicate-stale-retry', async () => {
    const before = await pull(config, config.tokens.a);
    // Network timeout replay of an already accepted stale write. It must
    // not increment version or replace later committed events.
    const repeated = await push(config, duplicateProbe.token, duplicateProbe.doc, duplicateProbe.expectedVersion);
    addEvidence('duplicate-stale-retry', repeated);
    assert(isConflict(repeated) || (isSuccess(repeated) && repeated.json.version === before.json.version),
      'Duplicate stale request was treated as a fresh mutation');
    const after = await pull(config, config.tokens.a);
    assertSnapshot(after, logIds(before.json.payload), vocabIds(before.json.payload), 'Duplicate retry');
    assert(after.json.version === before.json.version, 'Replay changed the committed server version');
    assert(sameArrayMembers(logIds(after.json.payload), logIds(before.json.payload)), 'Replay changed grammar log IDs');
    assert(sameArrayMembers(vocabIds(after.json.payload), vocabIds(before.json.payload)), 'Replay changed vocabulary events');
    latest = after;
    return 'Stale replay does not increment version or change unique event ID sets';
  });
  await check('offline-device-merge', async () => {
    const offlineSnapshot = await pull(config, config.tokens.a2);
    assert(isSuccess(offlineSnapshot), 'Offline device initial pull failed');
    const offlineWrite = appendEvents(offlineSnapshot.json.payload, runId, 'offline');
    const aWrite = appendEvents(offlineSnapshot.json.payload, runId, 'online');
    const online = await push(config, config.tokens.a, aWrite, offlineSnapshot.json.version);
    addEvidence('online-push', online);
    assert(isSuccess(online), 'Online write failed');
    const stale = await push(config, config.tokens.a2, offlineWrite, offlineSnapshot.json.version);
    addEvidence('offline-stale-push', stale);
    assert(isConflict(stale), 'Offline stale write overwrote the online device');
    const reread = await pull(config, config.tokens.a2);
    const merged = mergeUnion(reread.json.payload, offlineWrite);
    const retried = await push(config, config.tokens.a2, merged, reread.json.version);
    assert(isSuccess(retried), 'Offline device bounded recovery failed');
    const verified = await pull(config, config.tokens.a);
    assertSnapshot(verified, logIds(merged), vocabIds(merged), 'Offline merge');
    latest = verified;
    return 'Previously offline reviews replayed without losing online device reviews';
  });
  await check('cross-account-isolation', async () => {
    const otherBefore = await pull(config, config.tokens.b);
    assert(isSuccess(otherBefore) && otherBefore.json.version === 0 && otherBefore.json.payload == null,
      'Second account is not isolated and empty');
    const other = appendEvents(docFixture(uid('other')), uid('other'), 'other');
    // Deliberately spoof only payload metadata. Ownership must come from the
    // bearer token and the server sessions table, not JSON user.email.
    other.user = clone(latest.json.payload.user);
    const write = await push(config, config.tokens.b, other, 0);
    addEvidence('second-account-write', write);
    assert(isSuccess(write) && write.json.version === 1, 'Second account could not push its own disposable state');
    const otherAfter = await pull(config, config.tokens.b);
    const mainAfter = await pull(config, config.tokens.a);
    assertSnapshot(otherAfter, logIds(other), vocabIds(other), 'Second account');
    assertSnapshot(mainAfter, logIds(latest.json.payload), vocabIds(latest.json.payload), 'Main account after account B push');
    assert(!logIds(otherAfter.json.payload).some((id) => logIds(latest.json.payload).includes(id)), 'Cross-user grammar logs leaked to second account');
    assert(!vocabIds(otherAfter.json.payload).some((id) => vocabIds(latest.json.payload).includes(id)), 'Cross-user vocabulary events leaked');
    assert(mainAfter.json.version === latest.json.version, 'Token B mutated account A');
    latest = mainAfter;
    return 'Separate bearer session owns separate snapshot, even with spoofed payload metadata';
  });
  await check('schema-and-size-rejection', async () => {
    const saved = await pull(config, config.tokens.a);
    const malformed = clone(saved.json.payload);
    malformed.reviewLogs = 'not-an-array';
    const sparse = { version: 0, updatedAt: now(), user: {} };
    const tooBig = clone(saved.json.payload);
    tooBig.agent09Oversized = 'x'.repeat(2_200_000);
    for (const [label, bad] of [['malformed-logs', malformed], ['sparse-legacy', sparse], ['oversized-2mb', tooBig]]) {
      let response;
      try { response = await push(config, config.tokens.a, bad, saved.json.version); }
      catch (err) {
        // A server may close the connection on an oversized request. We
        // still require the next read to prove it was not committed.
        assert(label === 'oversized-2mb', `${label}: ${err.message}`);
        response = { status: 0, json: null };
      }
      addEvidence(label, response);
      assert(isRejected(response) || (label === 'oversized-2mb' && response.status === 0), `${label}: invalid push was accepted`);
      const verified = await pull(config, config.tokens.a);
      assert(isSuccess(verified) && verified.json.version === saved.json.version, `${label}: rejection changed server version`);
      assertSnapshot(verified, logIds(saved.json.payload), vocabIds(saved.json.payload), label);
      assert(verified.json.payload.agent09ForwardCompatibility?.runId === runId, `${label}: rejection stripped an unknown field`);
    }
    latest = saved;
    return 'Malformed, sparse and >2MB snapshots rejected atomically';
  });
  if (config.tokens.expired && config.tokens.revoked) {
    await check('expired-and-revoked-tokens', async () => {
      const before = await pull(config, config.tokens.a);
      for (const [kind, token] of [['expired', config.tokens.expired], ['revoked', config.tokens.revoked]]) {
        const p = await pull(config, token);
        const w = await push(config, token, appendEvents(before.json.payload, runId, kind), before.json.version);
        addEvidence(`${kind}-pull`, p); addEvidence(`${kind}-push`, w);
        assert([401, 403].includes(p.status) && !isSuccess(p), `${kind} token can pull`);
        assert([401, 403].includes(w.status) && !isSuccess(w), `${kind} token can push`);
      }
      const after = await pull(config, config.tokens.a);
      assert(after.json.version === before.json.version, 'Invalid tokens changed snapshot version');
      assertSnapshot(after, logIds(before.json.payload), vocabIds(before.json.payload), 'Revoked/expired tokens');
      return 'Both invalid session categories blocked from reading or mutating';
    });
  } else {
    results.push(record('expired-and-revoked-tokens', 'BLOCKED', 'Provide both SYNC_TOKEN_EXPIRED and SYNC_TOKEN_REVOKED from disposable identities'));
  }
  if (config.checkpoint) {
    const snapshot = await pull(config, config.tokens.a);
    assertSnapshot(snapshot, logIds(latest.json.payload), vocabIds(latest.json.payload), 'Recovery checkpoint');
    const data = {
      schemaVersion: 1,
      runId,
      minimumVersion: snapshot.json.version,
      expectedGrammarIds: logIds(snapshot.json.payload),
      expectedVocabularyIds: vocabIds(snapshot.json.payload),
      expectedUnknownRunId: snapshot.json.payload.agent09ForwardCompatibility?.runId,
    };
    await writeFile(config.checkpoint, JSON.stringify(data, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    results.push(record('restart-recovery', 'BLOCKED', `Checkpoint saved at ${config.checkpoint}; restart disposable backend and run --mode=recovery-check`));
  } else {
    results.push(record('restart-recovery', 'BLOCKED', 'Provide --checkpoint=/tmp/sync-agent09-checkpoint.json, then restart staging backend and run recovery-check'));
  }
}

async function runRecovery(config, results, evidence) {
  assert(config.checkpoint, '--mode=recovery-check requires --checkpoint=PATH');
  const recorded = JSON.parse(await readFile(config.checkpoint, 'utf8'));
  assert(recorded.schemaVersion === 1 && recorded.expectedGrammarIds?.length && recorded.expectedVocabularyIds?.length,
    'Invalid synthetic-only checkpoint');
  const snapshot = await pull(config, config.tokens.a);
  evidence.push({ label: 'after-operator-restart', ...redacted(snapshot) });
  assertSnapshot(snapshot, recorded.expectedGrammarIds, recorded.expectedVocabularyIds, 'Recovery after restart');
  assert(snapshot.json.version >= recorded.minimumVersion, 'Server version reset after restart');
  assert(snapshot.json.payload.agent09ForwardCompatibility?.runId === recorded.expectedUnknownRunId,
    'Unknown fields missing after restart');
  results.push(record('restart-recovery', 'PASS', `Recovered ${recorded.expectedGrammarIds.length} grammar and ${recorded.expectedVocabularyIds.length} vocabulary synthetic events`));
}

export async function run(argv = process.argv.slice(2)) {
  const results = [], evidence = [];
  let config;
  try { config = options(argv); }
  catch (error) {
    return { status: 'BLOCKED', results: [record('configuration', 'BLOCKED', error.message)], evidence };
  }
  try {
    if (config.mode === 'all') await runFull(config, results, evidence);
    else await runRecovery(config, results, evidence);
  } catch (error) {
    if (!results.some((r) => r.status === 'FAIL')) results.push(record('execution', 'FAIL', error.message));
  }
  if (config.mode === 'all') {
    for (const name of CHECKS) {
      if (!results.some((r) => r.name === name)) results.push(record(name, 'BLOCKED', 'Not run because a prerequisite failed'));
    }
  }
  return {
    status: results.some((r) => r.status === 'FAIL') ? 'FAIL' : results.some((r) => r.status === 'BLOCKED') ? 'BLOCKED' : 'PASS',
    endpoint: config.url, // No credentials, hostname deliberately supplied by operator.
    preconditionField: config.expectedField,
    results, evidence,
  };
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const report = await run();
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.status === 'FAIL' ? 1 : report.status === 'BLOCKED' ? 2 : 0;
}
