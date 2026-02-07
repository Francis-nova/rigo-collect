# Rigo Collect — Endpoints & Messaging PRD

This PRD catalogs all HTTP endpoints, external webhooks, internal endpoints, and inter-service messaging contracts to guide UX/UI design (Figma) and downstream implementation.

## Conventions
- API Prefix: Services use a global prefix where noted. Payments/Auth default to `/api`; API Gateway has no global prefix.
- Auth: Guards indicate authentication requirements. `InternalGuard` requires `X-Internal-Key` header; `AuthGuard('jwt')` requires a Bearer token.
- Dates: ISO 8601 strings unless specified.
- Currency: ISO currency code (e.g., `NGN`).

---

## API Gateway
- Global Prefix: none

### Health
- Method: GET
- Path: `/health`
- Auth: None
- Response: `{ status: 'ok', service: 'api-gateway' }`

### Demo (API Key Protected)
- Method: GET
- Path: `/v1/demo/protected`
- Auth: `ApiKeyGuard` (requires header `X-API-Key`)
- Response: `{ ok: true }`
- Notes: `ApiKeyGuard` validates the API key via RMQ call to Auth service (`auth.validateApiKey`). Attaches `req.merchant = { id }`.

---

## Payments Service
- Global Prefix: `/api`

### Pay-in Fees (NGN)
- Default: NGN 100 flat + 1.4% capped at NGN 2,000 applied to all businesses.
- Overrides: one per business (per currency, NGN only) in payments service; missing override falls back to default.
- Application: fee is deducted from incoming pay-in; wallet is credited with net amount; transactions store `fee` and metadata `{ grossAmount, netAmount, feeAmount, feeRule }`.
- Notifications: pay-in email events use the net amount after fee.

### Health
- Method: GET
- Path: `/api/health`
- Auth: None
- Response: `{ status: 'ok', service: 'payments' }`

### Webhooks
Controller prefix: `/api/v1/webhook`

1) BudPay Webhook
- Method: POST
- Path: `/api/v1/webhook/budpay`
- Auth: Provider-origin; HMAC/secret validation handled downstream.
- Headers: Provider-provided; no fixed header enforced here.
- Request Body: BudPay event payload (varies by event type).
- Response: `200 OK` with `{ data: 'budpay webhook received' }` on accept.
- Behavior: Enqueues job for `BudPay` processing; payout status and virtual account credits handled by processors.

2) Providus Webhook
- Method: POST
- Path: `/api/v1/webhook/providus`
- Auth: Signature check via header `X-auth-Signature` (case-insensitive). Must match configured `PROVIDUS_API_SIGNATURE`.
- Request Body (example fields):
  - `sessionId`, `accountNumber`, `tranRemarks`, `transactionAmount`, `settledAmount`, `feeAmount`, `vatAmount`, `currency`, `initiationTranRef`, `settlementId`, `sourceAccountNumber`, `sourceAccountName`, `sourceBankName`, `channelId`, `tranDateTime`, `ipServiceAddress`.
- Responses (JSON):
  - Success: `{ requestSuccessful: true, sessionId, responseMessage: 'transaction processed successfully', responseCode: '00' }`
  - Duplicate: `{ requestSuccessful: true, sessionId, responseMessage: 'duplicate transaction', responseCode: '01' }`
  - Invalid signature/account: `{ requestSuccessful: true, sessionId, responseMessage: 'invalid signature' | 'invalid account number', responseCode: '02' }`
  - Failure/retry: `{ requestSuccessful: true, responseMessage: 'system failure, retry', responseCode: '03' }`
- Behavior:
  - Validates signature, dedupes by `sessionId`, credits main account, records `COMPLETED` credit transaction, publishes pay-in email events to recipients resolved via Internal API + metadata.

### Email Event Publishing (outbound RMQ)
- On virtual account credit (pay-in): publishes `payments.collection.received` to `amq.topic`.
- On payout success/failure: publishes `payments.payout.success` or `payments.payout.failed`.
- Payloads defined in Post Office section below.

---

## Auth Service (Internal)
- Global Prefix: `/api`

### Validate Token (Internal)
- Method: GET
- Path: `/api/internal/validate-token`
- Auth:
  - `InternalGuard` → header `X-Internal-Key: <INTERNAL_API_KEY>`
  - `AuthGuard('jwt')` → header `Authorization: Bearer <token>`
- Response: `{ status: true, user, business, iat, exp }`
- Purpose: Internal token validation; `user` and `business` loaded by repositories.

### Get Business & Owner (Internal)
- Method: GET
- Path: `/api/internal/business/:id`
- Auth: `InternalGuard` → header `X-Internal-Key`
- Response:
  - Success: `{ status: true, business, owner }`
  - Not Found: `{ status: false, message: 'business_not_found' }`
- Purpose: Provide authoritative emails for business and owner to downstream services (e.g., Payments).

---

## Post Office (Email)
- Transport: RMQ consumer only; no public HTTP endpoints.
- Exchange: Consumes messages published to `amq.topic`.
- Retry/DLQ: Retries are republished with `x-retry` header up to `POSTOFFICE_MAX_RETRIES` (default 5). Then routed to DLX `post-office.dlx` with routing key `post-office.dlq`.

### Event Consumers
1) `payments.collection.received` — Pay-In Success Email
- Payload:
  - `to: string`, `subject: string`, `amount: number|string`, `currency: string`, `reference: string`, `date: string`, `status: 'SUCCESS'`, `firstName?: string`, `payer?: { name?: string; narration?: string }`
- Behavior: Renders pay-in success template and sends email.

2) `payments.payout.success` — Payout Success Email
- Payload:
  - `to`, `subject`, `amount`, `currency`, `reference`, `date`, `status: 'SUCCESS'`, `firstName?`, `beneficiary?: { name?, bankName?, accountNumber? }`
- Behavior: Renders payout success template.

3) `payments.payout.failed` — Payout Failure Email
- Payload:
  - `to`, `subject`, `amount`, `currency`, `reference`, `date`, `status: 'FAILED'`, `firstName?`, `beneficiary?: { name?, bankName?, accountNumber? }`, `retryMessage?: string`
- Behavior: Renders payout failure template.

4) `auth.email.verification` — Email Verification
- Payload: `{ to, subject, otp, firstName?, otpWindowMinutes? }`

5) `auth.password.changed` — Password Changed
- Payload: `{ to, subject, changedAt, firstName?, ipAddress?, device? }`

6) `auth.password.reset.init` — Password Reset Initiated
- Payload: `{ to, subject, otp, ttlSeconds, firstName? }`

7) `auth.password.reset.completed` — Password Reset Completed
- Payload: `{ to, subject, changedAt, firstName? }`

---

## Messaging Topology
- Exchange: `amq.topic` (durable)
- Producers:
  - Payments → publishes `payments.collection.received`, `payments.payout.success`, `payments.payout.failed`
- Consumers:
  - Post Office → subscribes to the above routing keys
  - API Gateway → RMQ clients for Auth (`queue: auth`) and Payments (`queue: payments`)
- Queues:
  - Auth microservice: `auth`
  - Payments microservice: `payments`
  - Post Office: bound to `amq.topic` based on routing keys (service configuration)

---

## Recipient Resolution (Payments → Auth)
- Payments resolves recipient emails via internal API:
  - Calls `/api/internal/business/:id` with `X-Internal-Key`.
  - Merges `business.email` and `owner.email` with account metadata fallbacks: `notifyEmails[]`, `notifyBusinessEmail`, `notifyOwnerEmail`.
  - Deduplicates and filters blanks.

---

## Error Handling & Status Codes (Summary)
- Webhooks:
  - Providus uses response codes: `00` (success), `01` (duplicate), `02` (invalid), `03` (retry needed).
- Payments & Auth HTTP endpoints use standard HTTP status codes; validation errors include structured fields.
- RMQ: Post Office retries up to configured max, then DLQs with headers capturing `x-error` and original routing.

---

## Design Notes (Figma)
- Email Templates: Provide layouts for payout success/failure and pay-in success. Include currency code, amount, reference, date, status, and optional beneficiary/payer sections.
- Webhook Admin Views (optional): Minimal status screens for incoming webhooks and transaction records.
- Internal Ops: No public UI, but consider system status cards for health endpoints.

---

## Open Questions
- Confirm BudPay webhook header/HMAC verification requirements for display in PRD.
- Should API Gateway expose additional public endpoints beyond health/demo?
- Any additional auth endpoints for merchant onboarding to include?
