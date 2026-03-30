# Paperclip — Adapters Guide

---

## 1. Adapters Overview

> **Source:** [docs.paperclip.ing/adapters/overview](https://docs.paperclip.ing/adapters/overview)

Adapters are the bridge between Paperclip's orchestration layer and agent runtimes. Each adapter knows how to invoke a specific type of AI agent and capture its results.

### How Adapters Work

When a heartbeat fires, Paperclip:

1. Looks up the agent's `adapterType` and `adapterConfig`
2. Calls the adapter's `execute()` function with the execution context
3. The adapter spawns or calls the agent runtime
4. The adapter captures stdout, parses usage/cost data, and returns a structured result

### Built-in Adapters

| Adapter | Type Key | Description |
|---|---|---|
| Claude Local | `claude_local` | Runs Claude Code CLI locally |
| Codex Local | `codex_local` | Runs OpenAI Codex CLI locally |
| Gemini Local | `gemini_local` | Runs Gemini CLI locally |
| OpenCode Local | `opencode_local` | Runs OpenCode CLI locally (multi-provider `provider/model`) |
| Cursor Local | `cursor` | Runs Cursor CLI locally |
| OpenClaw Gateway | `openclaw_gateway` | Sends wake payloads to an OpenClaw gateway |
| Hermes Local | `hermes_local` | Runs Hermes Agent CLI locally |
| Pi Local | `pi_local` | Runs Pi CLI locally |
| Process | `process` | Executes arbitrary shell commands |
| HTTP | `http` | Sends webhooks to external agents |

### Adapter Architecture

Each adapter is a package with three modules:

```
packages/adapters/<n>/
  src/
    index.ts            # Shared metadata (type, label, models)
    server/
      execute.ts        # Core execution logic
      parse.ts          # Output parsing
      test.ts           # Environment diagnostics
    ui/
      parse-stdout.ts   # Stdout -> transcript entries for run viewer
      build-config.ts   # Form values -> adapterConfig JSON
    cli/
      format-event.ts   # Terminal output for `paperclipai run --watch`
```

Three registries consume these modules:

| Registry | What it does |
|---|---|
| **Server** | Executes agents, captures results |
| **UI** | Renders run transcripts, provides config forms |
| **CLI** | Formats terminal output for live watching |

### Choosing an Adapter

- **Need a coding agent?** Use `claude_local`, `codex_local`, `gemini_local`, or `opencode_local`
- **Need to run a script or command?** Use `process`
- **Need to call an external service?** Use `http`
- **Need something custom?** Create your own adapter

---

## 2. Claude Local

> **Source:** [docs.paperclip.ing/adapters/claude-local](https://docs.paperclip.ing/adapters/claude-local)

The `claude_local` adapter runs Anthropic's Claude Code CLI locally. It supports session persistence, skills injection, and structured output parsing.

### Prerequisites

- Claude Code CLI installed (`claude` command available)
- `ANTHROPIC_API_KEY` set in the environment or agent config

### Configuration Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `cwd` | string | Yes | Working directory for the agent process (absolute path; created automatically if missing when permissions allow) |
| `model` | string | No | Claude model to use (e.g. `claude-opus-4-6`) |
| `promptTemplate` | string | No | Prompt used for all runs |
| `env` | object | No | Environment variables (supports secret refs) |
| `timeoutSec` | number | No | Process timeout (0 = no timeout) |
| `graceSec` | number | No | Grace period before force-kill |
| `maxTurnsPerRun` | number | No | Max agentic turns per heartbeat |
| `dangerouslySkipPermissions` | boolean | No | Skip permission prompts (dev only) |

### Prompt Templates

Templates support `{{variable}}` substitution:

| Variable | Value |
|---|---|
| `{{agentId}}` | Agent's ID |
| `{{companyId}}` | Company ID |
| `{{runId}}` | Current run ID |
| `{{agent.name}}` | Agent's name |
| `{{company.name}}` | Company name |

### Session Persistence

The adapter persists Claude Code session IDs between heartbeats. On the next wake, it resumes the existing conversation so the agent retains full context.

Session resume is cwd-aware: if the agent's working directory changed since the last run, a fresh session starts instead.

If resume fails with an unknown session error, the adapter automatically retries with a fresh session.

### Skills Injection

The adapter creates a temporary directory with symlinks to Paperclip skills and passes it via `--add-dir`. This makes skills discoverable without polluting the agent's working directory.

### Environment Test

Use the "Test Environment" button in the UI to validate the adapter config. It checks:

- Claude CLI is installed and accessible
- Working directory is absolute and available (auto-created if missing and permitted)
- API key/auth mode hints (`ANTHROPIC_API_KEY` vs subscription login)
- A live hello probe (`claude --print - --output-format stream-json --verbose` with prompt `Respond with hello.`) to verify CLI readiness

---

## 3. Codex Local

> **Source:** [docs.paperclip.ing/adapters/codex-local](https://docs.paperclip.ing/adapters/codex-local)

The `codex_local` adapter runs OpenAI's Codex CLI locally. It supports session persistence via `previous_response_id` chaining and skills injection through the global Codex skills directory.

### Prerequisites

- Codex CLI installed (`codex` command available)
- `OPENAI_API_KEY` set in the environment or agent config

### Configuration Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `cwd` | string | Yes | Working directory for the agent process (absolute path; created automatically if missing when permissions allow) |
| `model` | string | No | Model to use |
| `promptTemplate` | string | No | Prompt used for all runs |
| `env` | object | No | Environment variables (supports secret refs) |
| `timeoutSec` | number | No | Process timeout (0 = no timeout) |
| `graceSec` | number | No | Grace period before force-kill |
| `dangerouslyBypassApprovalsAndSandbox` | boolean | No | Skip safety checks (dev only) |

### Session Persistence

Codex uses `previous_response_id` for session continuity. The adapter serializes and restores this across heartbeats, allowing the agent to maintain conversation context.

### Skills Injection

The adapter symlinks Paperclip skills into the global Codex skills directory (`~/.codex/skills`). Existing user skills are not overwritten.

### Environment Test

The environment test checks:

- Codex CLI is installed and accessible
- Working directory is absolute and available (auto-created if missing and permitted)
- Authentication signal (`OPENAI_API_KEY` presence)
- A live hello probe (`codex exec --json -` with prompt `Respond with hello.`) to verify the CLI can actually run

---

## 4. Gemini Local

> **Source:** [docs.paperclip.ing/adapters/gemini-local](https://docs.paperclip.ing/adapters/gemini-local)

The `gemini_local` adapter runs Google's Gemini CLI locally. It supports session persistence with `--resume`, skills injection, and structured `stream-json` output parsing.

### Prerequisites

- Gemini CLI installed (`gemini` command available)
- `GEMINI_API_KEY` or `GOOGLE_API_KEY` set, or local Gemini CLI auth configured

### Configuration Fields

| Field | Type | Required | Description |
|---|---|---|---|
| `cwd` | string | Yes | Working directory for the agent process (absolute path; created automatically if missing when permissions allow) |
| `model` | string | No | Gemini model to use. Defaults to `auto`. |
| `promptTemplate` | string | No | Prompt used for all runs |
| `instructionsFilePath` | string | No | Markdown instructions file prepended to the prompt |
| `env` | object | No | Environment variables (supports secret refs) |
| `timeoutSec` | number | No | Process timeout (0 = no timeout) |
| `graceSec` | number | No | Grace period before force-kill |
| `yolo` | boolean | No | Pass `--approval-mode yolo` for unattended operation |

### Session Persistence

The adapter persists Gemini session IDs between heartbeats. On the next wake, it resumes the existing conversation with `--resume` so the agent retains context.

Session resume is cwd-aware: if the working directory changed since the last run, a fresh session starts instead.

If resume fails with an unknown session error, the adapter automatically retries with a fresh session.

### Skills Injection

The adapter symlinks Paperclip skills into the Gemini global skills directory (`~/.gemini/skills`). Existing user skills are not overwritten.

### Environment Test

Use the "Test Environment" button in the UI to validate the adapter config. It checks:

- Gemini CLI is installed and accessible
- Working directory is absolute and available (auto-created if missing and permitted)
- API key/auth hints (`GEMINI_API_KEY` or `GOOGLE_API_KEY`)
- A live hello probe (`gemini --output-format json "Respond with hello."`) to verify CLI readiness

---

## 5. Process Adapter

> **Source:** [docs.paperclip.ing/adapters/process](https://docs.paperclip.ing/adapters/process)

The `process` adapter executes arbitrary shell commands. Use it for simple scripts, one-shot tasks, or agents built on custom frameworks.

### When to Use

- Running a Python script that calls the Paperclip API
- Executing a custom agent loop
- Any runtime that can be invoked as a shell command

### When Not to Use

- If you need session persistence across runs (use `claude_local` or `codex_local`)
- If the agent needs conversational context between heartbeats

### Configuration

| Field | Type | Required | Description |
|---|---|---|---|
| `command` | string | Yes | Shell command to execute |
| `cwd` | string | No | Working directory |
| `env` | object | No | Environment variables |
| `timeoutSec` | number | No | Process timeout |

### How It Works

1. Paperclip spawns the configured command as a child process
2. Standard Paperclip environment variables are injected (`PAPERCLIP_AGENT_ID`, `PAPERCLIP_API_KEY`, etc.)
3. The process runs to completion
4. Exit code determines success/failure

### Example

An agent that runs a Python script:

```json
{
  "adapterType": "process",
  "adapterConfig": {
    "command": "python3 /path/to/agent.py",
    "cwd": "/path/to/workspace",
    "timeoutSec": 300
  }
}
```

The script can use the injected environment variables to authenticate with the Paperclip API and perform work.

---

## 6. HTTP Adapter

> **Source:** [docs.paperclip.ing/adapters/http](https://docs.paperclip.ing/adapters/http)

The `http` adapter sends a webhook request to an external agent service. The agent runs externally and Paperclip just triggers it.

### When to Use

- Agent runs as an external service (cloud function, dedicated server)
- Fire-and-forget invocation model
- Integration with third-party agent platforms

### When Not to Use

- If the agent runs locally on the same machine (use `process`, `claude_local`, or `codex_local`)
- If you need stdout capture and real-time run viewing

### Configuration

| Field | Type | Required | Description |
|---|---|---|---|
| `url` | string | Yes | Webhook URL to POST to |
| `headers` | object | No | Additional HTTP headers |
| `timeoutSec` | number | No | Request timeout |

### How It Works

1. Paperclip sends a POST request to the configured URL
2. The request body includes the execution context (agent ID, task info, wake reason)
3. The external agent processes the request and calls back to the Paperclip API
4. Response from the webhook is captured as the run result

### Request Body

The webhook receives a JSON payload with:

```json
{
  "runId": "...",
  "agentId": "...",
  "companyId": "...",
  "context": {
    "taskId": "...",
    "wakeReason": "...",
    "commentId": "..."
  }
}
```

The external agent uses `PAPERCLIP_API_URL` and an API key to call back to Paperclip.

---

## 7. Creating an Adapter

> **Source:** [docs.paperclip.ing/adapters/creating-an-adapter](https://docs.paperclip.ing/adapters/creating-an-adapter)

Build a custom adapter to connect Paperclip to any agent runtime.

If you're using Claude Code, the `create-agent-adapter` skill can guide you through the full adapter creation process interactively. Just ask Claude to create a new adapter and it will walk you through each step.

### Package Structure

```
packages/adapters/<n>/
  package.json
  tsconfig.json
  src/
    index.ts            # Shared metadata
    server/
      index.ts          # Server exports
      execute.ts        # Core execution logic
      parse.ts          # Output parsing
      test.ts           # Environment diagnostics
    ui/
      index.ts          # UI exports
      parse-stdout.ts   # Transcript parser
      build-config.ts   # Config builder
    cli/
      index.ts          # CLI exports
      format-event.ts   # Terminal formatter
```

### Step 1: Root Metadata

`src/index.ts` is imported by all three consumers. Keep it dependency-free.

```typescript
export const type = "my_agent";        // snake_case, globally unique
export const label = "My Agent (local)";
export const models = [
  { id: "model-a", label: "Model A" },
];
export const agentConfigurationDoc = `# my_agent configuration
Use when: ...
Don't use when: ...
Core fields: ...
`;
```

### Step 2: Server Execute

`src/server/execute.ts` is the core. It receives an `AdapterExecutionContext` and returns an `AdapterExecutionResult`.

Key responsibilities:

1. Read config using safe helpers (`asString`, `asNumber`, etc.)
2. Build environment with `buildPaperclipEnv(agent)` plus context vars
3. Resolve session state from `runtime.sessionParams`
4. Render prompt with `renderTemplate(template, data)`
5. Spawn the process with `runChildProcess()` or call via `fetch()`
6. Parse output for usage, costs, session state, errors
7. Handle unknown session errors (retry fresh, set `clearSession: true`)

### Step 3: Environment Test

`src/server/test.ts` validates the adapter config before running.

Return structured diagnostics:

- `error` for invalid/unusable setup
- `warn` for non-blocking issues
- `info` for successful checks

### Step 4: UI Module

- `parse-stdout.ts` — converts stdout lines to `TranscriptEntry[]` for the run viewer
- `build-config.ts` — converts form values to `adapterConfig` JSON
- Config fields React component in `ui/src/adapters/<n>/config-fields.tsx`

### Step 5: CLI Module

`format-event.ts` — pretty-prints stdout for `paperclipai run --watch` using `picocolors`.

### Step 6: Register

Add the adapter to all three registries:

1. `server/src/adapters/registry.ts`
2. `ui/src/adapters/registry.ts`
3. `cli/src/adapters/registry.ts`

### Skills Injection

Make Paperclip skills discoverable to your agent runtime without writing to the agent's working directory:

1. **Best: tmpdir + flag** — create tmpdir, symlink skills, pass via CLI flag, clean up after
2. **Acceptable: global config dir** — symlink to the runtime's global plugins directory
3. **Acceptable: env var** — point a skills path env var at the repo's `skills/` directory
4. **Last resort: prompt injection** — include skill content in the prompt template

### Security

- Treat agent output as untrusted (parse defensively, never execute)
- Inject secrets via environment variables, not prompts
- Configure network access controls if the runtime supports them
- Always enforce timeout and grace period
