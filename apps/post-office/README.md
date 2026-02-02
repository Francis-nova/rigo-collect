# Post Office Service

A NestJS microservice that listens to RabbitMQ events and sends transactional emails via SMTP (Nodemailer).

## Environment Variables

Set the following variables (for local development you can place them in an `.env` file located at the workspace root):

- `RABBITMQ_URL` – connection string, e.g. `amqp://guest:guest@localhost:5672`.
- `SMTP_HOST` – SMTP server host (e.g. `127.0.0.1`).
- `SMTP_PORT` – SMTP server port (e.g. `1025`).
- `SMTP_SECURE` – `true` to use TLS, otherwise `false`.
- `SMTP_USER` / `SMTP_PASS` – credentials if authentication is required.
- `MAIL_FROM` – default sender address, e.g. `no-reply@rigo-collect.com`.

## Scripts

```bash
pnpm --filter @apps/post-office dev    # run locally with ts-node
pnpm --filter @apps/post-office build  # compile & copy templates
```
