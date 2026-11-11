# BrandGuard AI — Compliance Benchmark Dataset

## Overview
90 labelled items for evaluating brand compliance review: 63 `dev` items for development and tuning, 27 `test` items frozen for final evaluation.

## Labelling Rules
- **violation**: text breaches at least one policy (banned phrase, non-standard terminology, missing disclaimer, unsupported claim, bad citation, or inappropriate tone).
- **compliant**: text satisfies all policies; `categories` is `[]`.
- **hard_case**: `true` if the item is a hard negative (compliant but superficially risky) or hard positive (violation but obfuscated).

## Banned Phrases
`guaranteed returns`, `risk-free investment`, `instant wealth`, `100% profit`, `crypto moon`

## Required Disclaimer
All investment-product copy must include: *"Investments are subject to market risk."*

## Preferred Terminology
Use `digital financial services` (not `money app`) and `secure transactions` (not `unhackable transfers`).

## Test Split — FROZEN
The `test` split **must not** be used for model tuning, threshold selection, or feature engineering. Reserve it for final, one-shot evaluation only.

## Provenance
Items were drafted with AI assistance and then reviewed by the team. Unicode lookalike characters in hard positives are intentional and machine-detectable.

## How to Run
```bash
python -m benchmark.run --split dev
python -m benchmark.run --split test --confirm-final  # frozen final evaluation only
```

