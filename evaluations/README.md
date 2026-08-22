# Model-to-render evaluation set

`cases.json` defines ten repeatable tasks spanning new projects, existing-project edits, captions, audio, Chinese typography, data validation, transitions, dynamic metadata, remote-asset fallback, and failure recovery.

## Evaluation protocol

Run every case in a fresh copy of its fixture with the same Harness profile, model, reasoning setting, and time budget.

For each run, record:

1. Whether the agent inspected the workspace before editing.
2. Whether lint and type checks passed on the first attempt.
3. Whether the requested representative still rendered and was inspected.
4. Whether the final artifact rendered without manual code repair.
5. Probe results: width, height, fps, duration, codecs, streams, and file size.
6. Visual checks for blank frames, overflow, missing assets, and transition boundaries.
7. Wall time, tool calls, and any human intervention.

The versioned thresholds in `cases.json` are release gates, not marketing claims. A release report must contain the exact Harness version, model route, commit, host platform, case results, and skipped checks. Do not count a source-only check as a rendered pass.

## Commands

Validate the evaluation contract:

```bash
npm run eval:validate
```

Run the local deterministic demo proof and tool integration smoke when the v0.3 tools are available:

```bash
npm run test:e2e
```

Model-backed runs may require a configured non-production model credential. Keep credentials in the Harness credential store and never in evaluation fixtures or reports.
