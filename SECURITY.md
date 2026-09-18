# Security

## Principles

- Never commit credentials or provider API keys.
- Store secrets in environment variables or the deployment secret manager.
- Validate all external payloads before persistence.
- Treat documents and model outputs as untrusted input.
- Apply authorization before exposing fund, company, or document data in production.
- Add audit logging before enabling multi-user production workflows.

## Reporting

Do not disclose security vulnerabilities in public issues. Use a private security reporting channel once configured for the deployment.
