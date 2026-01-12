# Payments Platform Monorepo (Turbo + NestJS)

This monorepo hosts a production-grade, modular payments platform built with NestJS microservices and Turborepo.

Apps (NestJS services)
- api-gateway: Public API for merchants (API-key auth, rate limiting)
- auth: Merchant onboarding, API keys, RBAC
- payments: Virtual accounts, collections, payouts, ledger hooks
- post-office: Notifications (email/SMS), event-driven

Shared packages
- @pkg/config, @pkg/interfaces, @pkg/dto, @pkg/errors, @pkg/logging, @pkg/common

Quick start
1. Install PNPM and Turbo
2. Create a local RabbitMQ or use a managed broker
3. Copy env samples in each app to .env and set values
4. Install deps and run dev services

```
# install pnpm if needed
npm i -g pnpm@9

# install dependencies
pnpm install

# run individual services
pnpm dev:api-gateway
pnpm dev:auth
pnpm dev:payments
pnpm dev:post-office
```
