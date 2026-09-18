# AI and Research Layer

The research layer is intentionally separated from the deterministic financial engine.

## Allowed AI responsibilities

- Extract candidate facts from documents.
- Summarize supplied evidence.
- Identify contradictions and diligence questions.
- Draft analyst prose.
- Retrieve and cite relevant evidence.

## Prohibited behavior

The model must not silently invent revenue, ARR, valuation, market size, customer metrics, or funding data.

## Evidence contract

AI-generated statements should point to source evidence where possible. Calculated metrics should come from the feature engine, not from free-form model arithmetic.

## Production evolution

A future retrieval layer can store chunked documents and embeddings while preserving the same Evidence interface. This lets the LLM implementation change without changing the financial model.
