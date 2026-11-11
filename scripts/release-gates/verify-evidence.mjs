#!/usr/bin/env node
/** Fail-closed evidence verifier. No network, writes, or runtime side effects. */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = fileURLToPath(new URL('.', import.meta.url));
const filename = process.argv.find(a => a.endsWith('.json')) ??
  resolve(here, '../../docs/qa/curriculum-v1/gates.json');
const strict = process.argv.includes('--release');
const gates = JSON.parse(readFileSync(resolve(filename), 'utf8'));
if (!Array.isArray(gates) || !gates.length) throw Error('Expected nonempty gate array');
const seen = new Set();
const allowed = new Set(['PASS', 'FAIL', 'BLOCKED', 'NOT RUN']);
const tracks = new Set(['A', 'B', 'SEC', 'NATIVE', 'OPS']);
const totals = { PASS: 0, FAIL: 0, BLOCKED: 0, 'NOT RUN': 0 };
let invalid = 0;
for (const gate of gates) {
  if (!gate || typeof gate.id !== 'string' || seen.has(gate.id) ||
      !allowed.has(gate.status) || !tracks.has(gate.track)) {
    console.error('INVALID gate:', gate?.id ?? '?');
    invalid++;
    continue;
  }
  seen.add(gate.id);
  totals[gate.status]++;
  if (gate.status === 'PASS') {
    const e = gate.evidence;
    if (!e || !/^[a-f0-9]{40}$/.test(e.sha ?? '') || !e.environment ||
        !e.commandOrProcedure || !e.expected || !e.actual || !e.artifactOrLog) {
      console.error('UNSUBSTANTIATED PASS:', gate.id);
      invalid++;
    }
  } else if (gate.status === 'FAIL' && !gate.repro && !gate.issue) {
    console.error('FAIL missing reproduction/issue:', gate.id);
    invalid++;
  } else if (gate.status === 'BLOCKED' && !gate.reason) {
    console.error('BLOCKED missing reason:', gate.id);
    invalid++;
  }
}
console.log('Release gates:', JSON.stringify(totals), 'of', seen.size);
if (invalid) process.exitCode = 2;
else if (strict && (totals.FAIL || totals.BLOCKED || totals['NOT RUN'])) {
  console.error('NOT RELEASABLE: every gate needs a supported PASS.');
  process.exitCode = 1;
}
