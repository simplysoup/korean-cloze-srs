/** Agent 13: exercise evidence/verifier tooling in Jest without extra packages. */
import { execFileSync, spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
test('release gate report has 32 distinct, non-passing unverified gates', () => {
  const root = resolve(__dirname, '../..');
  const src = resolve(root, 'docs/qa/curriculum-v1/gates.json');
  const gates = JSON.parse(readFileSync(src,'utf8')) as {id:string;status:string}[];
  expect(gates).toHaveLength(32);
  expect(new Set(gates.map(g=>g.id)).size).toBe(32);
  expect(gates.every(g=>g.status==='BLOCKED'||g.status==='NOT RUN')).toBe(true);
  const cmd = resolve(root,'scripts/release-gates/verify-evidence.mjs');
  const report = execFileSync(process.execPath,[cmd,src],{encoding:'utf8'});
  expect(report).toContain('32');
  const strict = spawnSync(process.execPath,[cmd,src,'--release'],{encoding:'utf8'});
  expect(strict.status).toBe(1); // Fail closed, never confuse unrun with passed.
});
test('stable grammar review fixture compares only normalized synthetic history', () => {
  const root = resolve(__dirname,'../..');
  const cmd = resolve(root,'scripts/release-gates/compare-snapshots.mjs');
  const fixture = resolve(root,'scripts/release-gates/fixtures/synthetic-grammar-progress.json');
  const result = execFileSync(process.execPath,[cmd,fixture,fixture],{encoding:'utf8'});
  expect(result).toContain('MATCH: synthetic progress/events identical');
  expect(result).toContain('baseline=2 candidate=2');
});
