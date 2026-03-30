# Paperclip — Deploy Guide

---

## 1. Deployment Overview

> **Source:** [docs.paperclip.ing/deploy/overview](https://docs.paperclip.ing/deploy/overview)

Paperclip supports three deployment configurations, from zero-friction local to internet-facing production.

### Deployment Modes

| Mode | Auth | Best For |
|---|---|---|
| `local_trusted` | No login required | Single-operator local machine |
| `authenticated` + `private` | Login required | Private network (Tailscale, VPN, LAN) |
| `authenticated` + `public` | Login required | Internet-facing cloud deployment |

### Quick Comparison

#### Local Trusted (Default)

- Loopback-only host binding (localhost)
- No human login flow
- Fastest local startup
- Best for: solo development and experimentation

#### Authenticated + Private

- Login required via Better Auth
- Binds to all interfaces for network access
- Auto base URL mode (lower friction)
- Best for: team access over Tailscale or local network

#### Authenticated + Public

- Login required
- Explicit public URL required
- Stricter security checks
- Best for: cloud hosting, internet-facing deployment

### Choosing a Mode

- **Just trying Paperclip?** Use `local_trusted` (the default)
- **Sharing with a team on private network?** Use `authenticated` + `private`
- **Deploying to the cloud?** Use `authenticated` + `public`

Set the mode during onboarding:

```bash
pnpm paperclipai onboard
```

Or update it later:

```bash
pnpm paperclipai configure --section server
```

---

## 2. Local Development

> **Source:** [docs.paperclip.ing/deploy/local-development](https://docs.paperclip.ing/deploy/local-development)

Run Paperclip locally with zero external dependencies.

### Prerequisites

- Node.js 20+
- pnpm 9+

### Start Dev Server

```bash
pnpm install
pnpm dev
```

This starts:

- **API server** at `http://localhost:3100`
- **UI** served by the API server in dev middleware mode (same origin)

No Docker or external database required. Paperclip uses embedded PostgreSQL automatically.

### One-Command Bootstrap

For a first-time install:

```bash
pnpm paperclipai run
```

This does:

1. Auto-onboards if config is missing
2. Runs `paperclipai doctor` with repair enabled
3. Starts the server when checks pass

### Tailscale/Private Auth Dev Mode

To run in `authenticated/private` mode for network access:

```bash
pnpm dev --tailscale-auth
```

This binds the server to `0.0.0.0` for private-network access.

Allow additional private hostnames:

```bash
pnpm paperclipai allowed-hostname dotta-macbook-pro
```

### Health Checks

```bash
curl http://localhost:3100/api/health
# -> {"status":"ok"}

curl http://localhost:3100/api/companies
# -> []
```

### Reset Dev Data

To wipe local data and start fresh:

```bash
rm -rf ~/.paperclip/instances/default/db
pnpm dev
```

### Data Locations

| Data | Path |
|---|---|
| Config | `~/.paperclip/instances/default/config.json` |
| Database | `~/.paperclip/instances/default/db` |
| Storage | `~/.paperclip/instances/default/data/storage` |
| Secrets key | `~/.paperclip/instances/default/secrets/master.key` |
| Logs | `~/.paperclip/instances/default/logs` |

Override with environment variables:

```bash
PAPERCLIP_HOME=/custom/path PAPERCLIP_INSTANCE_ID=dev pnpm paperclipai run
```

---

## 3. Docker

> **Source:** [docs.paperclip.ing/deploy/docker](https://docs.paperclip.ing/deploy/docker)

Run Paperclip in Docker without installing Node or pnpm locally.

### Compose Quickstart (Recommended)

```bash
docker compose -f docker-compose.quickstart.yml up --build
```

Open `http://localhost:3100`.

Defaults:

- Host port: `3100`
- Data directory: `./data/docker-paperclip`

Override with environment variables:

```bash
PAPERCLIP_PORT=3200 PAPERCLIP_DATA_DIR=./data/pc \
  docker compose -f docker-compose.quickstart.yml up --build
```

### Manual Docker Build

```bash
docker build -t paperclip-local .
docker run --name paperclip \
  -p 3100:3100 \
  -e HOST=0.0.0.0 \
  -e PAPERCLIP_HOME=/paperclip \
  -v "$(pwd)/data/docker-paperclip:/paperclip" \
  paperclip-local
```

### Data Persistence

All data is persisted under the bind mount (`./data/docker-paperclip`):

- Embedded PostgreSQL data
- Uploaded assets
- Local secrets key
- Agent workspace data

### Claude and Codex Adapters in Docker

The Docker image pre-installs:

- `claude` (Anthropic Claude Code CLI)
- `codex` (OpenAI Codex CLI)

Pass API keys to enable local adapter runs inside the container:

```bash
docker run --name paperclip \
  -p 3100:3100 \
  -e HOST=0.0.0.0 \
  -e PAPERCLIP_HOME=/paperclip \
  -e OPENAI_API_KEY=sk-... \
  -e ANTHROPIC_API_KEY=sk-... \
  -v "$(pwd)/data/docker-paperclip:/paperclip" \
  paperclip-local
```

Without API keys, the app runs normally — adapter environment checks will surface missing prerequisites.

---

## 4. Deployment Modes

> **Source:** [docs.paperclip.ing/deploy/deployment-modes](https://docs.paperclip.ing/deploy/deployment-modes)

Paperclip supports two runtime modes with different security profiles.

### `local_trusted`

The default mode. Optimized for single-operator local use.

- **Host binding**: loopback only (localhost)
- **Authentication**: no login required
- **Use case**: local development, solo experimentation
- **Board identity**: auto-created local board user

```bash
# Set during onboard
pnpm paperclipai onboard
# Choose "local_trusted"
```

### `authenticated`

Login required. Supports two exposure policies.

#### `authenticated` + `private`

For private network access (Tailscale, VPN, LAN).

- **Authentication**: login required via Better Auth
- **URL handling**: auto base URL mode (lower friction)
- **Host trust**: private-host trust policy required

```bash
pnpm paperclipai onboard
# Choose "authenticated" -> "private"
```

Allow custom Tailscale hostnames:

```bash
pnpm paperclipai allowed-hostname my-machine
```

#### `authenticated` + `public`

For internet-facing deployment.

- **Authentication**: login required
- **URL**: explicit public URL required
- **Security**: stricter deployment checks in doctor

```bash
pnpm paperclipai onboard
# Choose "authenticated" -> "public"
```

### Board Claim Flow

When migrating from `local_trusted` to `authenticated`, Paperclip emits a one-time claim URL at startup:

```
/board-claim/<token>?code=<code>
```

A signed-in user visits this URL to claim board ownership. This:

- Promotes the current user to instance admin
- Demotes the auto-created local board admin
- Ensures active company membership for the claiming user

### Changing Modes

Update the deployment mode:

```bash
pnpm paperclipai configure --section server
```

Runtime override via environment variable:

```bash
PAPERCLIP_DEPLOYMENT_MODE=authenticated pnpm paperclipai run
```

---

## 5. Database

> **Source:** [docs.paperclip.ing/deploy/database](https://docs.paperclip.ing/deploy/database)

Paperclip uses PostgreSQL via Drizzle ORM. There are three ways to run the database.

### 1. Embedded PostgreSQL (Default)

Zero config. If you don't set `DATABASE_URL`, the server starts an embedded PostgreSQL instance automatically.

```bash
pnpm dev
```

On first start, the server:

1. Creates `~/.paperclip/instances/default/db/` for storage
2. Ensures the `paperclip` database exists
3. Runs migrations automatically
4. Starts serving requests

Data persists across restarts. To reset: `rm -rf ~/.paperclip/instances/default/db`.

The Docker quickstart also uses embedded PostgreSQL by default.

### 2. Local PostgreSQL (Docker)

For a full PostgreSQL server locally:

```bash
docker compose up -d
```

This starts PostgreSQL 17 on `localhost:5432`. Set the connection string:

```bash
cp .env.example .env
# DATABASE_URL=postgres://paperclip:paperclip@localhost:5432/paperclip
```

Push the schema:

```bash
DATABASE_URL=postgres://paperclip:paperclip@localhost:5432/paperclip \
  npx drizzle-kit push
```

### 3. Hosted PostgreSQL (Supabase)

For production, use a hosted provider like [Supabase](https://supabase.com/).

1. Create a project at [database.new](https://database.new)
2. Copy the connection string from Project Settings > Database
3. Set `DATABASE_URL` in your `.env`

Use the **direct connection** (port 5432) for migrations and the **pooled connection** (port 6543) for the application.

If using connection pooling, disable prepared statements:

```typescript
// packages/db/src/client.ts
export function createDb(url: string) {
  const sql = postgres(url, { prepare: false });
  return drizzlePg(sql, { schema });
}
```

### Switching Between Modes

| `DATABASE_URL` | Mode |
|---|---|
| Not set | Embedded PostgreSQL |
| `postgres://...localhost...` | Local Docker PostgreSQL |
| `postgres://...supabase.com...` | Hosted Supabase |

The Drizzle schema (`packages/db/src/schema/`) is the same regardless of mode.

---

## 6. Secrets Management

> **Source:** [docs.paperclip.ing/deploy/secrets](https://docs.paperclip.ing/deploy/secrets)

Paperclip encrypts secrets at rest using a local master key. Agent environment variables that contain sensitive values (API keys, tokens) are stored as encrypted secret references.

### Default Provider: `local_encrypted`

Secrets are encrypted with a local master key stored at:

```
~/.paperclip/instances/default/secrets/master.key
```

This key is auto-created during onboarding. The key never leaves your machine.

### Configuration

#### CLI Setup

Onboarding writes default secrets config:

```bash
pnpm paperclipai onboard
```

Update secrets settings:

```bash
pnpm paperclipai configure --section secrets
```

Validate secrets config:

```bash
pnpm paperclipai doctor
```

#### Environment Overrides

| Variable | Description |
|---|---|
| `PAPERCLIP_SECRETS_MASTER_KEY` | 32-byte key as base64, hex, or raw string |
| `PAPERCLIP_SECRETS_MASTER_KEY_FILE` | Custom key file path |
| `PAPERCLIP_SECRETS_STRICT_MODE` | Set to `true` to enforce secret refs |

### Strict Mode

When strict mode is enabled, sensitive env keys (matching `*_API_KEY`, `*_TOKEN`, `*_SECRET`) must use secret references instead of inline plain values.

```bash
PAPERCLIP_SECRETS_STRICT_MODE=true
```

Recommended for any deployment beyond local trusted.

### Migrating Inline Secrets

If you have existing agents with inline API keys in their config, migrate them to encrypted secret refs:

```bash
pnpm secrets:migrate-inline-env         # dry run
pnpm secrets:migrate-inline-env --apply # apply migration
```

### Secret References in Agent Config

Agent environment variables use secret references:

```json
{
  "env": {
    "ANTHROPIC_API_KEY": {
      "type": "secret_ref",
      "secretId": "8f884973-c29b-44e4-8ea3-6413437f8081",
      "version": "latest"
    }
  }
}
```

The server resolves and decrypts these at runtime, injecting the real value into the agent process environment.

---

## 7. Storage

> **Source:** [docs.paperclip.ing/deploy/storage](https://docs.paperclip.ing/deploy/storage)

Paperclip stores uploaded files (issue attachments, images) using a configurable storage provider.

### Local Disk (Default)

Files are stored at:

```
~/.paperclip/instances/default/data/storage
```

No configuration required. Suitable for local development and single-machine deployments.

### S3-Compatible Storage

For production or multi-node deployments, use S3-compatible object storage (AWS S3, MinIO, Cloudflare R2, etc.).

Configure via CLI:

```bash
pnpm paperclipai configure --section storage
```

### Configuration

| Provider | Best For |
|---|---|
| `local_disk` | Local development, single-machine deployments |
| `s3` | Production, multi-node, cloud deployments |

Storage configuration is stored in the instance config file:

```
~/.paperclip/instances/default/config.json
```

---

## 8. Environment Variables

> **Source:** [docs.paperclip.ing/deploy/environment-variables](https://docs.paperclip.ing/deploy/environment-variables)

All environment variables that Paperclip uses for server configuration.

### Server Configuration

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3100` | Server port |
| `HOST` | `127.0.0.1` | Server host binding |
| `DATABASE_URL` | (embedded) | PostgreSQL connection string |
| `PAPERCLIP_HOME` | `~/.paperclip` | Base directory for all Paperclip data |
| `PAPERCLIP_INSTANCE_ID` | `default` | Instance identifier (for multiple local instances) |
| `PAPERCLIP_DEPLOYMENT_MODE` | `local_trusted` | Runtime mode override |

### Secrets

| Variable | Default | Description |
|---|---|---|
| `PAPERCLIP_SECRETS_MASTER_KEY` | (from file) | 32-byte encryption key (base64/hex/raw) |
| `PAPERCLIP_SECRETS_MASTER_KEY_FILE` | `~/.paperclip/.../secrets/master.key` | Path to key file |
| `PAPERCLIP_SECRETS_STRICT_MODE` | `false` | Require secret refs for sensitive env vars |

### Agent Runtime (Injected into agent processes)

These are set automatically by the server when invoking agents:

| Variable | Description |
|---|---|
| `PAPERCLIP_AGENT_ID` | Agent's unique ID |
| `PAPERCLIP_COMPANY_ID` | Company ID |
| `PAPERCLIP_API_URL` | Paperclip API base URL |
| `PAPERCLIP_API_KEY` | Short-lived JWT for API auth |
| `PAPERCLIP_RUN_ID` | Current heartbeat run ID |
| `PAPERCLIP_TASK_ID` | Issue that triggered this wake |
| `PAPERCLIP_WAKE_REASON` | Wake trigger reason |
| `PAPERCLIP_WAKE_COMMENT_ID` | Comment that triggered this wake |
| `PAPERCLIP_APPROVAL_ID` | Resolved approval ID |
| `PAPERCLIP_APPROVAL_STATUS` | Approval decision |
| `PAPERCLIP_LINKED_ISSUE_IDS` | Comma-separated linked issue IDs |

### LLM Provider Keys (for adapters)

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Anthropic API key (for Claude Local adapter) |
| `OPENAI_API_KEY` | OpenAI API key (for Codex Local adapter) |
