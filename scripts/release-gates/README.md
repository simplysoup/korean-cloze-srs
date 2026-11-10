# Agent 13 release evidence verifier

Non-destructive and offline; this script never contacts an API or modifies progress. From repo root:

```sh
node scripts/release-gates/verify-evidence.mjs
node scripts/release-gates/verify-evidence.mjs --release
```

The first validates the matrix schema and status/evidence integrity. The second also exits nonzero if **any** gate is FAIL, BLOCKED, or NOT RUN. A PASS requires exact 40-character commit SHA, environment, command/procedure, expected, actual and redacted artifact/log. FAIL requires repro or issue; BLOCKED requires reason.

Test users must be disposable/synthetic. Never commit passwords, tokens, addresses, session cookies or real learner progress. Security Jest assertions are intentionally red on the unsafe pre-fix branch: do not skip/weaken them to pass CI.
